"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuthStore } from "@/stores/auth.store";
import * as authService from "@/services/auth.service";
import type { LoginPayload, ChangePasswordPayload } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// useAuth
//
// One hook to rule all auth interactions.
// Components import this — never the store or service directly.
//
// Usage:
//   const { user, isAuthenticated, login, logout, isAdmin } = useAuth();
// ─────────────────────────────────────────────────────────────────────────────

export const useAuth = () => {
    const router = useRouter();

    const {
        user,
        isAuthenticated,
        isHydrating,
        setSession,
        clearSession,
        hasRole,
        can,
        isAdmin,
    } = useAuthStore();

    // ── Login ────────────────────────────────────────────────────────────────
    const loginMutation = useMutation({
        mutationFn: (payload: LoginPayload) => authService.login(payload),

        onSuccess: (response) => {
            const { accessToken, user } = response.data;
            setSession(accessToken, user);
            toast.success(`Welcome back, ${user.name}`);
            router.replace("/dashboard");
        },

        onError: (error: Error) => {
            toast.error(error.message ?? "Login failed. Please try again.");
        },
    });

    // ── Logout ───────────────────────────────────────────────────────────────
    const logoutMutation = useMutation({
        mutationFn: () => authService.logout(),

        onSettled: () => {
            // Always clear local state, even if the API call fails.
            clearSession();
            router.replace("/login");
        },
    });

    // ── Logout all devices ───────────────────────────────────────────────────
    const logoutAllMutation = useMutation({
        mutationFn: () => authService.logoutAll(),

        onSettled: () => {
            clearSession();
            router.replace("/login");
        },
    });

    // ── Change password ──────────────────────────────────────────────────────
    const changePasswordMutation = useMutation({
        mutationFn: (payload: ChangePasswordPayload) =>
            authService.changePassword(payload),

        onSuccess: () => {
            toast.success("Password changed. Please log in again on other devices.");
        },

        onError: (error: Error) => {
            toast.error(error.message ?? "Password change failed.");
        },
    });

    return {
        // State
        user,
        isAuthenticated,
        isHydrating,

        // Derived
        isAdmin: isAdmin(),
        hasRole,
        can,

        // Actions
        login: loginMutation.mutate,
        loginAsync: loginMutation.mutateAsync,
        isLoggingIn: loginMutation.isPending,
        loginError: loginMutation.error,

        logout: () => logoutMutation.mutate(),
        isLoggingOut: logoutMutation.isPending,

        logoutAll: () => logoutAllMutation.mutate(),
        isLoggingOutAll: logoutAllMutation.isPending,

        changePassword: changePasswordMutation.mutate,
        isChangingPassword: changePasswordMutation.isPending,
        changePasswordError: changePasswordMutation.error,
    };
};