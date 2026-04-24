"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import * as userService from "@/services/user.service";
import type {
    UserListParams,
    RegisterPayload,
    UpdateUserPayload,
    AdminResetPasswordPayload,
} from "@/services/user.service";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const staffKeys = {
    all: ["staff"] as const,
    list: (p?: UserListParams) => ["staff", "list", p] as const,
    detail: (id: string) => ["staff", "detail", id] as const,
    roles: ["staff", "roles"] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────────────────────────

export function useStaffList(params?: UserListParams) {
    return useQuery({
        queryKey: staffKeys.list(params),
        queryFn: () => userService.getAllUsers(params),
        select: (res) => res.data,
    });
}

export function useStaffUser(id: string) {
    return useQuery({
        queryKey: staffKeys.detail(id),
        queryFn: () => userService.getUserById(id),
        select: (res) => res.data.user,
        enabled: !!id,
    });
}

export function useRoles() {
    return useQuery({
        queryKey: staffKeys.roles,
        queryFn: () => userService.getRoles(),
        select: (res) => res.data.roles.filter((r) => r.isActive),
        staleTime: Infinity,   // roles never change at runtime
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/auth/register — admin creates a staff account */
export function useRegisterStaff() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: RegisterPayload) => userService.registerStaff(payload),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: staffKeys.all });
            toast.success(`Account created for ${res.data.user.name}.`);
        },
        onError: (err: Error) => {
            toast.error(err.message ?? "Failed to create account.");
        },
    });
}

/** PATCH /api/users/:id — update name, phone, role, isActive */
export function useUpdateStaff(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: UpdateUserPayload) => userService.updateUser(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: staffKeys.all });
            qc.invalidateQueries({ queryKey: staffKeys.detail(id) });
            toast.success("Account updated.");
        },
        onError: (err: Error) => {
            // Backend returns "You cannot deactivate your own account" as a 400
            toast.error(err.message ?? "Failed to update account.");
        },
    });
}

/** PATCH /api/users/:id/reset-password — admin forces password reset */
export function useAdminResetPassword(id: string) {
    return useMutation({
        mutationFn: (payload: AdminResetPasswordPayload) =>
            userService.adminResetPassword(id, payload),
        onSuccess: () => {
            // Backend message: "Password reset successfully. User will need to log in again."
            toast.success("Password reset. The user will need to log in again.");
        },
        onError: (err: Error) => {
            toast.error(err.message ?? "Failed to reset password.");
        },
    });
}

/** DELETE /api/users/:id — soft delete (isActive: false) */
export function useDeactivateStaff() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => userService.deactivateUser(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: staffKeys.all });
            toast.success("Account deactivated.");
        },
        onError: (err: Error) => {
            // Backend returns "You cannot deactivate your own account" as a 400
            toast.error(err.message ?? "Failed to deactivate account.");
        },
    });
}