"use client";

import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { Label }  from "@/components/ui/label";
import { cn }     from "@/lib/utils";

const TODAY    = new Date();
const fmt      = (d: Date) => format(d, "yyyy-MM-dd");

export const PRESETS = [
    { label: "Today",        from: fmt(TODAY),                        to: fmt(TODAY) },
    { label: "Yesterday",    from: fmt(subDays(TODAY, 1)),            to: fmt(subDays(TODAY, 1)) },
    { label: "Last 7 days",  from: fmt(subDays(TODAY, 6)),            to: fmt(TODAY) },
    { label: "Last 30 days", from: fmt(subDays(TODAY, 29)),           to: fmt(TODAY) },
    { label: "This week",    from: fmt(startOfWeek(TODAY, { weekStartsOn: 1 })), to: fmt(endOfWeek(TODAY, { weekStartsOn: 1 })) },
    { label: "This month",   from: fmt(startOfMonth(TODAY)),          to: fmt(endOfMonth(TODAY)) },
];

interface ReportFiltersProps {
    from:          string;
    to:            string;
    onFromChange:  (v: string) => void;
    onToChange:    (v: string) => void;
    onRun:         () => void;
    isLoading?:    boolean;
}

export function ReportFilters({
    from, to,
    onFromChange, onToChange,
    onRun, isLoading,
}: ReportFiltersProps) {
    const setPreset = (preset: typeof PRESETS[0]) => {
        onFromChange(preset.from);
        onToChange(preset.to);
    };

    return (
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            {/* Preset shortcuts */}
            <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                    <button
                        key={p.label}
                        onClick={() => setPreset(p)}
                        className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium border transition-all",
                            from === p.from && to === p.to
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-transparent text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                        )}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Manual date inputs + run button */}
            <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">From</Label>
                    <Input
                        type="date"
                        value={from}
                        onChange={(e) => onFromChange(e.target.value)}
                        className="h-9 text-sm w-40"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">To</Label>
                    <Input
                        type="date"
                        value={to}
                        min={from}
                        onChange={(e) => onToChange(e.target.value)}
                        className="h-9 text-sm w-40"
                    />
                </div>
                <Button
                    onClick={onRun}
                    disabled={!from || !to || isLoading}
                    className="h-9"
                >
                    <CalendarDays className="w-4 h-4 mr-2" />
                    {isLoading ? "Loading…" : "Run report"}
                </Button>
            </div>
        </div>
    );
}