"use client";

import { Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuditStats } from "@/hooks/audit/useAudit";
import { cn } from "@/lib/utils";

const MODULE_DOT: Record<string, string> = {
    users: "bg-blue-400",
    reservations: "bg-green-400",
    rooms: "bg-yellow-400",
    guests: "bg-purple-400",
    billing: "bg-pink-400",
    settings: "bg-orange-400",
};

export function AuditStatStrip() {
    const { data: stats, isLoading } = useAuditStats();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Total events */}
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-foreground leading-tight">
                        {stats.total.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-muted-foreground">Total audit events</p>
                </div>
            </div>

            {/* Top modules */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    By module
                </p>
                <div className="space-y-1.5">
                    {stats.byModule.slice(0, 4).map(({ module, count }) => {
                        const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                        return (
                            <div key={module} className="flex items-center gap-2">
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-full flex-shrink-0",
                                    MODULE_DOT[module] ?? "bg-gray-400"
                                )} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between text-xs mb-0.5">
                                        <span className="capitalize text-muted-foreground">{module}</span>
                                        <span className="font-medium text-foreground">{count}</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Top actors */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Most active
                </p>
                <div className="space-y-2">
                    {stats.recentActors.slice(0, 4).map(({ userId, name, count }) => (
                        <div key={userId} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-semibold flex-shrink-0">
                                    {name?.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()}
                                </div>
                                <span className="text-xs text-muted-foreground truncate">{name}</span>
                            </div>
                            <span className="text-xs font-semibold text-foreground flex-shrink-0">
                                {count}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}