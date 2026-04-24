"use client";

import { useMemo } from "react";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AuditLogEntry } from "./AuditLogEntry";
import type { AuditLog } from "@/services/audit.service";

interface DayGroup {
    label: string;
    logs: AuditLog[];
}

// Group logs by calendar day
const groupByDay = (logs: AuditLog[]): DayGroup[] => {
    const map = new Map<string, AuditLog[]>();

    logs.forEach((log) => {
        const dateKey = format(parseISO(log.createdAt), "yyyy-MM-dd");
        if (!map.has(dateKey)) map.set(dateKey, []);
        map.get(dateKey)!.push(log);
    });

    return [...map.entries()].map(([dateKey, dayLogs]) => {
        const date = parseISO(dateKey);
        let label: string;

        if (isToday(date)) label = "Today";
        else if (isYesterday(date)) label = "Yesterday";
        else label = format(date, "EEEE, dd MMMM yyyy");

        return { label, logs: dayLogs };
    });
};

interface AuditLogListProps {
    logs: AuditLog[];
    isLoading: boolean;
    page: number;
    totalPages: number;
    total: number;
    limit: number;
    onPageChange: (p: number) => void;
}

export function AuditLogList({
    logs, isLoading,
    page, totalPages, total, limit,
    onPageChange,
}: AuditLogListProps) {

    const groups = useMemo(() => groupByDay(logs), [logs]);

    // Loading skeleton
    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                        <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2 pt-1">
                            <Skeleton className="h-4 w-3/4 rounded" />
                            <Skeleton className="h-3 w-1/2 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Empty
    if (logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <ScrollText className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No audit logs found</p>
                <p className="text-sm text-muted-foreground">
                    Try adjusting your filters or date range.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {groups.map(({ label, logs: dayLogs }) => (
                <div key={label}>
                    {/* Day header */}
                    <div className="flex items-center gap-3 mb-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                            {label}
                        </p>
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                            {dayLogs.length} event{dayLogs.length !== 1 ? "s" : ""}
                        </span>
                    </div>

                    {/* Log entries */}
                    <div className="space-y-4">
                        {dayLogs.map((log, idx) => (
                            <AuditLogEntry
                                key={log._id}
                                log={log}
                                isLastInDay={idx === dayLogs.length - 1}
                            />
                        ))}
                    </div>
                </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-border text-sm text-muted-foreground">
                    <p>
                        Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total.toLocaleString("en-IN")}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline" size="sm"
                            disabled={page === 1}
                            onClick={() => onPageChange(page - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline" size="sm"
                            disabled={page === totalPages}
                            onClick={() => onPageChange(page + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}