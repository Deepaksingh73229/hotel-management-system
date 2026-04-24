"use client";

import { useState } from "react";
import { ShieldOff } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { AuditStatStrip } from "@/components/audit/AuditStatStrip";
import { AuditFilters, type AuditFiltersState } from "@/components/audit/AuditFilters";
import { AuditLogList } from "@/components/audit/AuditLogList";
import { useAuditLogs } from "@/hooks/audit/useAudit";
import { usePermission } from "@/hooks/auth/usePermission";

const LIMIT = 30;

const EMPTY_FILTERS: AuditFiltersState = {
    search: "", module: "", action: "", performedBy: "", from: "", to: "",
};

export default function AuditLogsPage() {
    const { isAdmin } = usePermission();
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<AuditFiltersState>(EMPTY_FILTERS);

    // Build params — only send non-empty values
    const params = {
        page, limit: LIMIT,
        sortBy: "createdAt" as const,
        sortOrder: "desc" as const,
        ...(filters.search && { search: filters.search }),
        ...(filters.module && { module: filters.module as any }),
        ...(filters.action && { action: filters.action }),
        ...(filters.performedBy && { performedBy: filters.performedBy }),
        ...(filters.from && { from: new Date(filters.from).toISOString() }),
        ...(filters.to && { to: new Date(filters.to).toISOString() }),
    };

    const { data, isLoading } = useAuditLogs(params);

    const logs = data?.logs ?? [];
    const pagination = data?.pagination;

    const handleFilterChange = (next: AuditFiltersState) => {
        setFilters(next);
        setPage(1);    // reset to page 1 on filter change
    };

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <ShieldOff className="w-5 h-5 text-destructive" />
                </div>
                <p className="text-sm font-medium">Access restricted</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                    Only administrators can view audit logs.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-5xl">

            <PageHeader
                title="Audit logs"
                subtitle="A complete, tamper-evident trail of every action across the system."
            />

            {/* Stats */}
            <AuditStatStrip />

            {/* Filters */}
            <AuditFilters
                filters={filters}
                onChange={handleFilterChange}
                onReset={() => { setFilters(EMPTY_FILTERS); setPage(1); }}
            />

            {/* Results count */}
            {!isLoading && pagination && (
                <p className="text-xs text-muted-foreground">
                    {pagination.total.toLocaleString("en-IN")} event{pagination.total !== 1 ? "s" : ""} found
                    {pagination.pages > 1 && ` · page ${page} of ${pagination.pages}`}
                </p>
            )}

            {/* Log list */}
            <div className="bg-card border border-border rounded-xl p-5">
                <AuditLogList
                    logs={logs}
                    isLoading={isLoading}
                    page={page}
                    totalPages={pagination?.pages ?? 1}
                    total={pagination?.total ?? 0}
                    limit={LIMIT}
                    onPageChange={setPage}
                />
            </div>
        </div>
    );
}