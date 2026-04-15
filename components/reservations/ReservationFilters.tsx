"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
    RESERVATION_STATUS_META,
    type ReservationStatus,
} from "@/types";

const VARIANT_ACTIVE: Record<string, string> = {
    blue: "bg-blue-100   text-blue-700   border-blue-300   dark:bg-blue-900/30   dark:text-blue-400   dark:border-blue-700",
    green: "bg-green-100  text-green-700  border-green-300  dark:bg-green-900/30  dark:text-green-400  dark:border-green-700",
    gray: "bg-gray-100   text-gray-700   border-gray-300   dark:bg-gray-800      dark:text-gray-300   dark:border-gray-600",
    red: "bg-red-100    text-red-700    border-red-300    dark:bg-red-900/30    dark:text-red-400    dark:border-red-700",
    orange: "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700",
    purple: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700",
};

const STATUS_FILTERS: (ReservationStatus | "all")[] = [
    "all",
    "confirmed",
    "checked_in",
    "checked_out",
    "cancelled",
    "no_show",
    "enquiry",
    "waitlisted",
];

interface ReservationFiltersProps {
    search: string;
    statusFilter: ReservationStatus | "all";
    onSearchChange: (v: string) => void;
    onStatusChange: (v: ReservationStatus | "all") => void;
}

export function ReservationFilters({
    search,
    statusFilter,
    onSearchChange,
    onStatusChange,
}: ReservationFiltersProps) {
    return (
        <div className="space-y-3">
            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <Input
                    placeholder="Search confirmation # or guest name…"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-8 h-9 text-sm"
                />
            </div>

            {/* Status pills */}
            <div className="flex flex-wrap gap-1.5">
                {STATUS_FILTERS.map((status) => {
                    const isActive = statusFilter === status;
                    const meta = status !== "all" ? RESERVATION_STATUS_META[status] : null;

                    return (
                        <button
                            key={status}
                            onClick={() => onStatusChange(status)}
                            className={cn(
                                "px-3 py-1 rounded-full text-xs font-medium border transition-all",
                                isActive
                                    ? meta
                                        ? VARIANT_ACTIVE[meta.variant]
                                        : "bg-foreground text-background border-foreground"
                                    : "bg-transparent text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                            )}
                        >
                            {status === "all" ? "All" : RESERVATION_STATUS_META[status].label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}