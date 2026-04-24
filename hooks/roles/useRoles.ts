"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import * as roleService from "@/services/role.service";
import type {
    CreateRolePayload,
    UpdateRolePayload,
    SetPermissionsPayload,
    TogglePermissionPayload,
    PermissionModule,
} from "@/services/role.service";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const roleKeys = {
    allRoles: ["roles"] as const,
    role: (id: string) => ["roles", id] as const,
    permissions: ["permissions"] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// PERMISSION QUERIES
// ─────────────────────────────────────────────────────────────────────────────

export function usePermissions(module?: PermissionModule) {
    return useQuery({
        queryKey: [...roleKeys.permissions, module],
        queryFn: () => roleService.getAllPermissions(module),
        select: (res) => res.data.permissions,
        staleTime: Infinity,   // permissions are static after seed
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// PERMISSION MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

export function useSeedPermissions() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => roleService.seedPermissions(),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: roleKeys.permissions });
            toast.success(res.message ?? "Permissions seeded.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Seed failed."),
    });
}

export function useDeletePermission() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => roleService.deletePermission(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: roleKeys.permissions });
            qc.invalidateQueries({ queryKey: roleKeys.allRoles });
            toast.success("Permission deleted.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to delete permission."),
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// ROLE QUERIES
// ─────────────────────────────────────────────────────────────────────────────

export function useRoles(isActive?: boolean) {
    return useQuery({
        queryKey: [...roleKeys.allRoles, isActive],
        queryFn: () => roleService.getAllRoles(isActive),
        select: (res) => res.data.roles,
        staleTime: Infinity,
    });
}

export function useRole(id: string) {
    return useQuery({
        queryKey: roleKeys.role(id),
        queryFn: () => roleService.getRoleById(id),
        select: (res) => res.data.role,
        enabled: !!id,
        staleTime: Infinity,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// ROLE MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

export function useCreateRole() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateRolePayload) => roleService.createRole(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: roleKeys.allRoles });
            toast.success("Role created.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to create role."),
    });
}

export function useUpdateRole(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: UpdateRolePayload) => roleService.updateRole(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: roleKeys.allRoles });
            qc.invalidateQueries({ queryKey: roleKeys.role(id) });
            toast.success("Role updated.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to update role."),
    });
}

/**
 * Full replace — used by the permissions matrix when saving all changes at once.
 */
export function useSetRolePermissions(roleId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: SetPermissionsPayload) =>
            roleService.setRolePermissions(roleId, payload),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: roleKeys.allRoles });
            qc.invalidateQueries({ queryKey: roleKeys.role(roleId) });
            toast.success(res.message ?? "Permissions saved.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to save permissions."),
    });
}

/**
 * Toggle a single permission on/off — used for live checkbox toggling.
 */
export function useTogglePermission(roleId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ permissionId, checked }: { permissionId: string; checked: boolean }) =>
            checked
                ? roleService.addPermissionToRole(roleId, { permissionId })
                : roleService.removePermissionFromRole(roleId, { permissionId }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: roleKeys.allRoles });
            qc.invalidateQueries({ queryKey: roleKeys.role(roleId) });
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to update permission."),
    });
}