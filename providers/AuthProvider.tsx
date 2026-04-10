"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { registerClientCallbacks } from "@/services/api/client";
import { getMe, logout as logoutApi } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";

// ─────────────────────────────────────────────────────────────────────────────
// AUTH PROVIDER
//
// Responsibilities:
//   1. Register token getter/setter/logout into the API client (once).
//   2. On every app load, call GET /api/auth/me using the stored access token.
//      If it succeeds  → hydrate the user object in the store.
//      If it fails 401 → the client interceptor will try to refresh.
//                        If refresh also fails → clearSession() → redirect login.
// ─────────────────────────────────────────────────────────────────────────────

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const {
        accessToken,
        setAccessToken,
        setUser,
        setHydrating,
        clearSession,
        setSession,
    } = useAuthStore();

    const router = useRouter();

    // ── Step 1: Wire the client callbacks (runs synchronously on mount) ──────
    useEffect(() => {
        registerClientCallbacks(
            // getToken — called by every request interceptor
            () => useAuthStore.getState().accessToken,

            // setToken — called after a successful silent refresh
            (token) => useAuthStore.getState().setAccessToken(token),

            // onLogout — called when refresh fails; clears state + redirects
            () => {
                useAuthStore.getState().clearSession();
                router.replace("/login");
            }
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Step 2: Hydrate user on every page load ───────────────────────────────
    useEffect(() => {
        const hydrate = async () => {
            setHydrating(true);

            if (!useAuthStore.getState().accessToken) {
                // No token in sessionStorage — user is not logged in.
                setHydrating(false);
                return;
            }

            try {
                const response = await getMe();
                setUser(response.data.user);
            } catch {
                // getMe failed even after silent refresh attempt in the interceptor.
                // The interceptor already called clearSession + redirected.
                clearSession();
            } finally {
                setHydrating(false);
            }
        };

        hydrate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <>{children}</>;
}