"use client";

import { useQuery } from "@tanstack/react-query";
import * as auditService from "@/services/audit.service";
import type { AuditListParams } from "@/services/audit.service";

export const auditKeys = {
    all: ["audit-logs"] as const,
    list: (p?: AuditListParams) => ["audit-logs", "list", p] as const,
    detail: (id: string) => ["audit-logs", id] as const,
    stats: (p?: { from?: string; to?: string }) => ["audit-logs", "stats", p] as const,
};

export function useAuditLogs(params?: AuditListParams) {
    return useQuery({
        queryKey: auditKeys.list(params),
        queryFn: () => auditService.getAllAuditLogs(params),
        select: (res) => res.data,
        staleTime: 1000 * 30,    // audit data stale after 30s
    });
}

export function useAuditLog(id: string) {
    return useQuery({
        queryKey: auditKeys.detail(id),
        queryFn: () => auditService.getAuditLogById(id),
        select: (res) => res.data.log,
        enabled: !!id,
        staleTime: Infinity,     // a log entry never changes
    });
}

export function useAuditStats(params?: { from?: string; to?: string }) {
    return useQuery({
        queryKey: auditKeys.stats(params),
        queryFn: () => auditService.getAuditStats(params),
        select: (res) => res.data,
        staleTime: 1000 * 60,
    });
}