import type { SearchParams } from "./api.types";

// ─────────────────────────────────────────────────────────────────────────────
// ROLE & PERMISSION
// Mirrors Role.models.js and Permission.models.js
// ─────────────────────────────────────────────────────────────────────────────

export type PermissionModule =
    | "reservations"
    | "rooms"
    | "guests"
    | "billing"
    | "housekeeping"
    | "reports"
    | "users"
    | "settings"
    | "audit";

export type PermissionAction = "create" | "read" | "update" | "delete" | "approve" | "export";

export interface Permission {
    _id: string;
    module: PermissionModule;
    action: PermissionAction;
    description?: string;
}

export type RoleName = "admin" | "front_desk";

export interface Role {
    _id: string;
    name: RoleName;
    displayName: string;
    permissions: Permission[];
    isActive: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// USER
// Mirrors User.models.js — never includes passwordHash or secrets
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthUser {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: Role;
    isActive: boolean;
    lastLoginAt?: string;
    createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST PAYLOADS
// These match your Zod validators on the backend exactly.
// ─────────────────────────────────────────────────────────────────────────────

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: string;           // ObjectId string
}

export interface ForgotPasswordPayload {
    email: string;
}

export interface ResetPasswordPayload {
    token: string;
    password: string;
    confirmPassword: string;
}

export interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

export interface UpdateUserPayload {
    name?: string;
    phone?: string;
    role?: string;          // ObjectId string
    isActive?: boolean;
}

export interface AdminResetPasswordPayload {
    newPassword: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE DATA SHAPES
// What's inside ApiResponse<T>.data for each auth endpoint.
// ─────────────────────────────────────────────────────────────────────────────

export interface LoginResponseData {
    accessToken: string;
    user: AuthUser;
}

export interface MeResponseData {
    user: AuthUser;
}

export interface RegisterResponseData {
    user: AuthUser;
}

export interface RefreshTokenResponseData {
    accessToken: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// USER LIST (admin)
// ─────────────────────────────────────────────────────────────────────────────

export interface UsersListData {
    users: AuthUser[];
    pagination: import("./api.types").PaginationMeta;
}

export interface UserListParams extends SearchParams {
    role?: string;
    isActive?: boolean;
}