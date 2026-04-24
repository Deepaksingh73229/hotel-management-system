"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Monitor, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AuditActionBadge } from "./AuditActionBadge";
import { AuditDiffViewer } from "./AuditDiffViewer";
import { cn } from "@/lib/utils";
import type { AuditLog } from "@/services/audit.service";

// ─── Initials from name ───────────────────────────────────────────────────────
const initials = (name: string) =>
    name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

// ─── Module colour dot ────────────────────────────────────────────────────────
const MODULE_DOT: Record<string, string> = {
    users: "bg-blue-400",
    reservations: "bg-green-400",
    rooms: "bg-yellow-400",
    guests: "bg-purple-400",
    billing: "bg-pink-400",
    settings: "bg-orange-400",
    audit: "bg-gray-400",
};

interface AuditLogEntryProps {
    log: AuditLog;
    isLastInDay?: boolean;
}

export function AuditLogEntry({ log, isLastInDay }: AuditLogEntryProps) {
    const [expanded, setExpanded] = useState(false);

    const hasDiff = log.previousValue !== undefined || log.newValue !== undefined;
    const hasDetails = hasDiff || log.ipAddress || log.userAgent;
    const dotColor = MODULE_DOT[log.module] ?? "bg-gray-400";

    return (
        <div className={cn(
            "flex gap-4 pb-4",
            !isLastInDay && "border-b border-border/60"
        )}>
            {/* ── Left: avatar ────────────────────────────────────── */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                    {initials(log.performedBy?.name ?? "?")}
                </div>
                {/* Module colour dot */}
                <div className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
            </div>

            {/* ── Right: content ──────────────────────────────────── */}
            <div className="flex-1 min-w-0 pt-0.5 space-y-1.5">

                {/* Header line */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Performer */}
                        <span className="text-sm font-medium text-foreground">
                            {log.performedBy?.name ?? "Unknown"}
                        </span>

                        {/* Action */}
                        <AuditActionBadge action={log.action} />

                        {/* Module */}
                        <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 capitalize"
                        >
                            {log.module}
                        </Badge>

                        {/* Target model if present */}
                        {log.targetModel && (
                            <span className="text-xs text-muted-foreground">
                                → {log.targetModel}
                            </span>
                        )}
                    </div>

                    {/* Timestamp */}
                    <time className="text-xs text-muted-foreground flex-shrink-0 whitespace-nowrap">
                        {format(new Date(log.createdAt), "HH:mm:ss")}
                    </time>
                </div>

                {/* Description */}
                {log.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {log.description}
                    </p>
                )}

                {/* Performer email */}
                <p className="text-xs text-muted-foreground/70">
                    {log.performedBy?.email}
                </p>

                {/* Expandable detail */}
                {hasDetails && (
                    <div>
                        {/* Diff toggle */}
                        {hasDiff && (
                            <AuditDiffViewer
                                previousValue={log.previousValue}
                                newValue={log.newValue}
                            />
                        )}

                        {/* IP + User agent — toggle separately */}
                        {(log.ipAddress || log.userAgent) && (
                            <button
                                type="button"
                                onClick={() => setExpanded((v) => !v)}
                                className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                            >
                                <Monitor className="w-3 h-3" />
                                {expanded ? "Hide" : "Show"} device info
                            </button>
                        )}

                        {expanded && (
                            <div className="mt-2 text-xs text-muted-foreground space-y-1 bg-muted/30 rounded-lg px-3 py-2">
                                {log.ipAddress && (
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3 h-3 flex-shrink-0" />
                                        <span className="font-mono">{log.ipAddress}</span>
                                    </div>
                                )}
                                {log.userAgent && (
                                    <div className="flex items-start gap-1.5">
                                        <Monitor className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                        <span className="break-all">{log.userAgent}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}