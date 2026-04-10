import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosError,
    type InternalAxiosRequestConfig,
} from "axios";

import { env } from "@/config/env";
import type { ApiError, RefreshTokenResponseData } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// TOKEN HELPERS
// These read/write from the auth store WITHOUT importing the store directly,
// which avoids circular deps. The store registers these callbacks on init.
// ─────────────────────────────────────────────────────────────────────────────

type TokenGetter = () => string | null;
type TokenSetter = (token: string | null) => void;
type LogoutHandler = () => void;

let _getToken: TokenGetter = () => null;
let _setToken: TokenSetter = () => { };
let _onLogout: LogoutHandler = () => { };

/** Called once in AuthProvider to wire up the store. */
export const registerClientCallbacks = (
    getToken: TokenGetter,
    setToken: TokenSetter,
    onLogout: LogoutHandler
) => {
    _getToken = getToken;
    _setToken = setToken;
    _onLogout = onLogout;
};

// ─────────────────────────────────────────────────────────────────────────────
// AXIOS INSTANCE
// ─────────────────────────────────────────────────────────────────────────────

const client: AxiosInstance = axios.create({
    baseURL: `${env.API_BASE_URL}/api`,
    withCredentials: true,          // send httpOnly refresh-token cookie
    timeout: 15_000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST INTERCEPTOR
// Attach the current access token to every outgoing request.
// ─────────────────────────────────────────────────────────────────────────────

client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = _getToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────────────────────────────────────
// SILENT TOKEN REFRESH
// On a 401, attempt one silent refresh via the httpOnly cookie.
// If the refresh succeeds → retry the original request with the new token.
// If the refresh fails    → logout the user.
//
// isRetry flag prevents infinite loops:
//   original request → 401 → refresh → retry original → (should succeed)
//   if retry also 401s → logout (don't loop again)
// ─────────────────────────────────────────────────────────────────────────────

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
    _isRetry?: boolean;
}

let _refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
    // If a refresh is already in flight (multiple concurrent 401s),
    // share the same promise instead of firing multiple refresh requests.
    if (_refreshPromise) return _refreshPromise;

    _refreshPromise = client
        .post<{ success: boolean; data: RefreshTokenResponseData }>(
            "/auth/refresh-token"
        )
        .then((res) => {
            const newToken = res.data.data.accessToken;
            _setToken(newToken);
            return newToken;
        })
        .finally(() => {
            _refreshPromise = null;
        });

    return _refreshPromise;
};

client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as RetryableRequestConfig;

        const is401 = error.response?.status === 401;
        const isRetry = originalRequest?._isRetry === true;
        const isRefreshRoute = originalRequest?.url?.includes("/auth/refresh-token");

        // Only attempt refresh once, and not on the refresh endpoint itself.
        if (is401 && !isRetry && !isRefreshRoute) {
            originalRequest._isRetry = true;

            try {
                const newToken = await refreshAccessToken();

                // Update the header on the queued request and retry.
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return client(originalRequest);
            } catch {
                // Refresh failed — session is dead, force logout.
                _onLogout();
                return Promise.reject(error);
            }
        }

        // For all other errors, normalise and re-throw.
        return Promise.reject(normalizeError(error));
    }
);

// ─────────────────────────────────────────────────────────────────────────────
// ERROR NORMALISATION
// Converts any axios error into a consistent ApiError shape so service
// functions and hooks never have to inspect raw AxiosError internals.
// ─────────────────────────────────────────────────────────────────────────────

export class ClientError extends Error {
    public readonly code: string;
    public readonly status: number;
    public readonly errors?: ApiError["errors"];

    constructor(apiError: ApiError, status: number) {
        super(apiError.message);
        this.name = "ClientError";
        this.code = apiError.code;
        this.status = status;
        this.errors = apiError.errors;
    }
}

const normalizeError = (error: AxiosError<ApiError>): ClientError | Error => {
    if (error.response?.data?.success === false) {
        return new ClientError(error.response.data, error.response.status);
    }

    if (error.code === "ECONNABORTED") {
        return new Error("Request timed out. Please check your connection.");
    }

    if (!error.response) {
        return new Error("Network error. Please check your connection.");
    }

    return error;
};

export default client;