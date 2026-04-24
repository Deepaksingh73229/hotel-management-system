"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { AUDIT_MODULES } from "@/services/audit.service";

// Common actions that appear across the system
const COMMON_ACTIONS = [
    "create", "update", "delete", "deactivate",
    "check_in", "check_out", "cancel", "no_show",
    "admin_reset_password", "change_password",
    "set_role_permissions", "seed_permissions",
];

export interface AuditFiltersState {
    search: string;
    module: string;
    action: string;
    performedBy: string;
    from: string;
    to: string;
}

const EMPTY: AuditFiltersState = {
    search: "", module: "", action: "", performedBy: "", from: "", to: "",
};

interface AuditFiltersProps {
    filters: AuditFiltersState;
    onChange: (filters: AuditFiltersState) => void;
    onReset: () => void;
}

export function AuditFilters({ filters, onChange, onReset }: AuditFiltersProps) {
    const set = (key: keyof AuditFiltersState) =>
        (value: string) => onChange({ ...filters, [key]: value });

    const hasActiveFilters = Object.values(filters).some((v) => v !== "");

    return (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            {/* Row 1: search + module + action */}
            <div className="flex flex-wrap gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="Search description…"
                        value={filters.search}
                        onChange={(e) => set("search")(e.target.value)}
                        className="pl-8 h-9 text-sm"
                    />
                </div>

                {/* Module */}
                <Select
                    value={filters.module || "all"}
                    onValueChange={(v) => set("module")(v === "all" ? "" : v)}
                >
                    <SelectTrigger className="w-40 h-9 text-sm">
                        <SelectValue placeholder="All modules" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All modules</SelectItem>
                        {AUDIT_MODULES.map((m) => (
                            <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Action */}
                <Select
                    value={filters.action || "all"}
                    onValueChange={(v) => set("action")(v === "all" ? "" : v)}
                >
                    <SelectTrigger className="w-52 h-9 text-sm">
                        <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All actions</SelectItem>
                        {COMMON_ACTIONS.map((a) => (
                            <SelectItem key={a} value={a}>
                                {a.replace(/_/g, " ")}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Reset */}
                {hasActiveFilters && (
                    <Button
                        variant="ghost" size="sm"
                        onClick={onReset}
                        className="gap-1.5 h-9 text-muted-foreground"
                    >
                        <X className="w-3.5 h-3.5" />
                        Clear
                    </Button>
                )}
            </div>

            {/* Row 2: date range */}
            <div className="flex flex-wrap gap-3 items-center">
                <span className="text-xs text-muted-foreground">Date range</span>
                <Input
                    type="datetime-local"
                    value={filters.from}
                    onChange={(e) => set("from")(e.target.value)}
                    className="h-9 text-sm w-52"
                />
                <span className="text-xs text-muted-foreground">to</span>
                <Input
                    type="datetime-local"
                    value={filters.to}
                    min={filters.from}
                    onChange={(e) => set("to")(e.target.value)}
                    className="h-9 text-sm w-52"
                />
            </div>
        </div>
    );
}