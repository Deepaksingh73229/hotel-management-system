import client from "./api/client";
import type { ApiResponse, PaginationMeta } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuditModule =
    | "users" | "reservations" | "rooms" | "guests"
    | "billing" | "housekeeping" | "reports" | "settings" | "audit";

export interface AuditPerformer {
    _id: string;
    name: string;
    email: string;
}

export interface AuditLog {
    _id: string;
    performedBy: AuditPerformer;
    module: string;
    action: string;
    targetId?: string;
    targetModel?: string;
    description?: string;
    previousValue?: unknown;
    newValue?: unknown;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
    updatedAt: string;
}

// ─── Query params ─────────────────────────────────────────────────────────────

export interface AuditListParams {
    module?: AuditModule;
    action?: string;
    performedBy?: string;
    targetId?: string;
    targetModel?: string;
    search?: string;
    from?: string;     // ISO datetime
    to?: string;
    page?: number;
    limit?: number;
    sortBy?: "createdAt" | "module" | "action";
    sortOrder?: "asc" | "desc";
}

// ─── Response shapes ──────────────────────────────────────────────────────────

export interface AuditListData {
    logs: AuditLog[];
    pagination: PaginationMeta;
}

export interface AuditStatsData {
    total: number;
    byModule: { module: string; count: number }[];
    byAction: { action: string; count: number }[];
    recentActors: { userId: string; name: string; email: string; count: number }[];
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

/** GET /api/audit-logs */
export const getAllAuditLogs = async (params?: AuditListParams) => {
    const res = await client.get<ApiResponse<AuditListData>>(
        "/audit-logs",
        { params }
    );
    return res.data;
};

/** GET /api/audit-logs/stats */
export const getAuditStats = async (params?: { from?: string; to?: string }) => {
    const res = await client.get<ApiResponse<AuditStatsData>>(
        "/audit-logs/stats",
        { params }
    );
    return res.data;
};

/** GET /api/audit-logs/:id */
export const getAuditLogById = async (id: string) => {
    const res = await client.get<ApiResponse<{ log: AuditLog }>>(`/audit-logs/${id}`);
    return res.data;
};

// ─── Constants ────────────────────────────────────────────────────────────────

export const AUDIT_MODULES: AuditModule[] = [
    "users", "reservations", "rooms", "guests",
    "billing", "housekeeping", "reports", "settings", "audit",
];