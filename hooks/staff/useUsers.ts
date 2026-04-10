"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import * as authService from "@/services/auth.service";
import type {
    UserListParams,
    RegisterPayload,
    UpdateUserPayload,
    AdminResetPasswordPayload,
} from "@/types";

// ─── Query keys — centralised so invalidations are consistent ─────────────────
export const userKeys = {
    all: ["users"] as const,
    list: (params?: UserListParams) => ["users", "list", params] as const,
    detail: (id: string) => ["users", "detail", id] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// LIST
// ─────────────────────────────────────────────────────────────────────────────

export function useUsers(params?: UserListParams) {
    return useQuery({
        queryKey: userKeys.list(params),
        queryFn: () => authService.getAllUsers(params),
        select: (res) => res.data,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// SINGLE
// ─────────────────────────────────────────────────────────────────────────────

export function useUser(id: string) {
    return useQuery({
        queryKey: userKeys.detail(id),
        queryFn: () => authService.getUserById(id),
        select: (res) => res.data.user,
        enabled: !!id,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

export function useCreateUser() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (payload: RegisterPayload) => authService.register(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: userKeys.all });
            toast.success("Staff account created successfully.");
        },
        onError: (err: Error) => {
            toast.error(err.message ?? "Failed to create staff account.");
        },
    });
}

export function useUpdateUser(id: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateUserPayload) => authService.updateUser(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: userKeys.all });
            toast.success("Staff account updated.");
        },
        onError: (err: Error) => {
            toast.error(err.message ?? "Failed to update staff account.");
        },
    });
}

export function useAdminResetPassword(id: string) {
    return useMutation({
        mutationFn: (payload: AdminResetPasswordPayload) =>
            authService.adminResetPassword(id, payload),
        onSuccess: () => {
            toast.success("Password reset successfully.");
        },
        onError: (err: Error) => {
            toast.error(err.message ?? "Failed to reset password.");
        },
    });
}

export function useDeactivateUser() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => authService.deactivateUser(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: userKeys.all });
            toast.success("Staff account deactivated.");
        },
        onError: (err: Error) => {
            toast.error(err.message ?? "Failed to deactivate account.");
        },
    });
}