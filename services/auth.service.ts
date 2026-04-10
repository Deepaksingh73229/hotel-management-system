import client from "./api/client";

import type {
    ApiResponse,
    LoginPayload,
    LoginResponseData,
    MeResponseData,
    RegisterPayload,
    RegisterResponseData,
    ForgotPasswordPayload,
    ResetPasswordPayload,
    ChangePasswordPayload,
    UpdateUserPayload,
    AdminResetPasswordPayload,
    UsersListData,
    UserListParams,
    AuthUser,
} from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Returns access token + user. Refresh token is set in httpOnly cookie by server.
 */
export const login = async (payload: LoginPayload) => {
    const res = await client.post<ApiResponse<LoginResponseData>>(
        "/auth/login",
        payload
    );
    return res.data;
};

/**
 * POST /api/auth/logout
 * Revokes the current refresh token. Clears cookie on server.
 */
export const logout = async () => {
    const res = await client.post<ApiResponse<null>>("/auth/logout");
    return res.data;
};

/**
 * POST /api/auth/logout-all
 * Revokes ALL refresh tokens for the user across all devices.
 */
export const logoutAll = async () => {
    const res = await client.post<ApiResponse<null>>("/auth/logout-all");
    return res.data;
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user. Used to hydrate the auth store on load.
 */
export const getMe = async () => {
    const res = await client.get<ApiResponse<MeResponseData>>("/auth/me");
    return res.data;
};

/**
 * PATCH /api/auth/change-password
 * Changes password for the currently authenticated user.
 */
export const changePassword = async (payload: ChangePasswordPayload) => {
    const res = await client.patch<ApiResponse<null>>(
        "/auth/change-password",
        payload
    );
    return res.data;
};

/**
 * POST /api/auth/forgot-password
 * Sends a reset link to the email (if it exists). Always returns 200.
 */
export const forgotPassword = async (payload: ForgotPasswordPayload) => {
    const res = await client.post<ApiResponse<null>>(
        "/auth/forgot-password",
        payload
    );
    return res.data;
};

/**
 * POST /api/auth/reset-password
 * Validates the raw reset token and sets the new password.
 */
export const resetPassword = async (payload: ResetPasswordPayload) => {
    const res = await client.post<ApiResponse<null>>(
        "/auth/reset-password",
        payload
    );
    return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// USER MANAGEMENT (admin only)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Admin creates a new staff account.
 */
export const register = async (payload: RegisterPayload) => {
    const res = await client.post<ApiResponse<RegisterResponseData>>(
        "/auth/register",
        payload
    );
    return res.data;
};

/**
 * GET /api/users
 * Admin: paginated, filterable list of all staff accounts.
 */
export const getAllUsers = async (params?: UserListParams) => {
    const res = await client.get<ApiResponse<UsersListData>>("/users", {
        params,
    });
    return res.data;
};

/**
 * GET /api/users/:id
 */
export const getUserById = async (id: string) => {
    const res = await client.get<ApiResponse<{ user: AuthUser }>>(`/users/${id}`);
    return res.data;
};

/**
 * PATCH /api/users/:id
 */
export const updateUser = async (id: string, payload: UpdateUserPayload) => {
    const res = await client.patch<ApiResponse<{ user: AuthUser }>>(
        `/users/${id}`,
        payload
    );
    return res.data;
};

/**
 * PATCH /api/users/:id/reset-password
 * Admin forces a password reset for a specific staff member.
 */
export const adminResetPassword = async (
    id: string,
    payload: AdminResetPasswordPayload
) => {
    const res = await client.patch<ApiResponse<null>>(
        `/users/${id}/reset-password`,
        payload
    );
    return res.data;
};

/**
 * DELETE /api/users/:id
 * Soft delete — sets isActive: false.
 */
export const deactivateUser = async (id: string) => {
    const res = await client.delete<ApiResponse<null>>(`/users/${id}`);
    return res.data;
};