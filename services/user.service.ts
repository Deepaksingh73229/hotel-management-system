/**
 * user.service.ts
 *
 * Maps 1-to-1 with user.controller.js endpoints.
 * All routes require protect + restrictTo("admin") on the backend.
 */

import client from "./api/client";
import type { ApiResponse } from "@/types";

// ─── Types that mirror the controller's response shapes ───────────────────────

export interface Role {
    _id: string;
    name: "admin" | "front_desk";
    displayName: string;
    isActive: boolean;
}

export interface StaffUser {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: { _id: string; name: string; displayName: string };
    isActive: boolean;
    lastLoginAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserListData {
    users: StaffUser[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export interface UserListParams {
    role?: string;     // role ObjectId
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

// ─── Payload types ────────────────────────────────────────────────────────────

export interface RegisterPayload {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: string;      // role ObjectId
}

export interface UpdateUserPayload {
    name?: string;
    phone?: string;
    role?: string;     // role ObjectId
    isActive?: boolean;
}

export interface AdminResetPasswordPayload {
    newPassword: string;   // min 8 chars — validated by controller
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

/**
 * GET /api/users
 * Returns paginated + filtered staff list.
 * Filter by role ObjectId, isActive boolean, or search string (name/email).
 */
export const getAllUsers = async (params?: UserListParams) => {
    const res = await client.get<ApiResponse<UserListData>>("/users", { params });
    return res.data;
};

/**
 * GET /api/users/:id
 */
export const getUserById = async (id: string) => {
    const res = await client.get<ApiResponse<{ user: StaffUser }>>(`/users/${id}`);
    return res.data;
};

/**
 * POST /api/auth/register
 * Admin creates a new staff account.
 * Lives on /auth/register — not /users — matching your routes file.
 */
export const registerStaff = async (payload: RegisterPayload) => {
    const res = await client.post<ApiResponse<{ user: StaffUser }>>(
        "/auth/register",
        payload
    );
    return res.data;
};

/**
 * PATCH /api/users/:id
 * Admin updates name, phone, role, or isActive.
 * Controller guards against self-deactivation.
 */
export const updateUser = async (id: string, payload: UpdateUserPayload) => {
    const res = await client.patch<ApiResponse<{ user: StaffUser }>>(
        `/users/${id}`,
        payload
    );
    return res.data;
};

/**
 * PATCH /api/users/:id/reset-password
 * Admin forces a password reset for a staff member.
 * Controller requires newPassword length >= 8.
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
 * Soft delete — controller sets isActive: false.
 * Hard delete is intentionally not exposed on the backend.
 */
export const deactivateUser = async (id: string) => {
    const res = await client.delete<ApiResponse<null>>(`/users/${id}`);
    return res.data;
};

/**
 * GET /api/roles
 * Returns active roles with their ObjectIds.
 * Used to populate role selectors in invite/edit forms.
 */
export const getRoles = async () => {
    const res = await client.get<ApiResponse<{ roles: Role[] }>>("/roles");
    return res.data;
};