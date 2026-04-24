import client from "./api/client";
import type { ApiResponse } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PermissionModule =
    | "reservations" | "rooms" | "guests" | "billing"
    | "housekeeping" | "reports" | "users" | "settings" | "audit";

export type PermissionAction =
    | "create" | "read" | "update" | "delete" | "approve" | "export";

export interface Permission {
    _id: string;
    module: PermissionModule;
    action: PermissionAction;
    description?: string;
    createdAt: string;
}

export interface Role {
    _id: string;
    name: "admin" | "front_desk";
    displayName: string;
    permissions: Permission[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// ─── Payload types ────────────────────────────────────────────────────────────

export interface CreatePermissionPayload {
    module: PermissionModule;
    action: PermissionAction;
    description?: string;
}

export interface CreateRolePayload {
    name: "admin" | "front_desk";
    displayName: string;
}

export interface UpdateRolePayload {
    displayName?: string;
    isActive?: boolean;
}

export interface SetPermissionsPayload {
    permissionIds: string[];
}

export interface TogglePermissionPayload {
    permissionId: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const PERMISSION_MODULES: PermissionModule[] = [
    "reservations", "rooms", "guests", "billing",
    "housekeeping", "reports", "users", "settings", "audit",
];

export const PERMISSION_ACTIONS: PermissionAction[] = [
    "create", "read", "update", "delete", "approve", "export",
];

// ─── Permission endpoints ─────────────────────────────────────────────────────

export const getAllPermissions = async (module?: PermissionModule) => {
    const res = await client.get<ApiResponse<{ permissions: Permission[] }>>(
        "/permissions",
        { params: module ? { module } : undefined }
    );
    return res.data;
};

export const createPermission = async (payload: CreatePermissionPayload) => {
    const res = await client.post<ApiResponse<{ permission: Permission }>>(
        "/permissions",
        payload
    );
    return res.data;
};

/** Idempotent — creates all module×action combos that don't exist yet */
export const seedPermissions = async () => {
    const res = await client.post<ApiResponse<{
        created: number;
        existing: number;
        total: number;
    }>>("/permissions/seed");
    return res.data;
};

export const deletePermission = async (id: string) => {
    const res = await client.delete<ApiResponse<null>>(`/permissions/${id}`);
    return res.data;
};

// ─── Role endpoints ───────────────────────────────────────────────────────────

export const getAllRoles = async (isActive?: boolean) => {
    const res = await client.get<ApiResponse<{ roles: Role[] }>>(
        "/roles",
        { params: isActive !== undefined ? { isActive } : undefined }
    );
    return res.data;
};

export const getRoleById = async (id: string) => {
    const res = await client.get<ApiResponse<{ role: Role }>>(`/roles/${id}`);
    return res.data;
};

export const createRole = async (payload: CreateRolePayload) => {
    const res = await client.post<ApiResponse<{ role: Role }>>("/roles", payload);
    return res.data;
};

export const updateRole = async (id: string, payload: UpdateRolePayload) => {
    const res = await client.patch<ApiResponse<{ role: Role }>>(`/roles/${id}`, payload);
    return res.data;
};

/** Full replace — sets the permissions array to exactly these IDs */
export const setRolePermissions = async (id: string, payload: SetPermissionsPayload) => {
    const res = await client.patch<ApiResponse<{ role: Role }>>(
        `/roles/${id}/permissions`,
        payload
    );
    return res.data;
};

/** Add a single permission without touching the rest */
export const addPermissionToRole = async (id: string, payload: TogglePermissionPayload) => {
    const res = await client.patch<ApiResponse<{ role: Role }>>(
        `/roles/${id}/permissions/add`,
        payload
    );
    return res.data;
};

/** Remove a single permission without touching the rest */
export const removePermissionFromRole = async (id: string, payload: TogglePermissionPayload) => {
    const res = await client.patch<ApiResponse<{ role: Role }>>(
        `/roles/${id}/permissions/remove`,
        payload
    );
    return res.data;
};