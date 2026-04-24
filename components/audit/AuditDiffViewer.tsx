"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Pretty-print JSON with null safety ───────────────────────────────────────
const prettyJson = (value: unknown): string => {
    if (value === undefined || value === null) return "—";
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
};

interface DiffPanelProps {
    label: string;
    value: unknown;
    color: string;     // tailwind classes for the header
    bgColor: string;     // tailwind classes for the pre block
}

function DiffPanel({ label, value, color, bgColor }: DiffPanelProps) {
    const hasValue = value !== undefined && value !== null;

    return (
        <div className="flex-1 min-w-0 space-y-1.5">
            <p className={cn("text-xs font-semibold uppercase tracking-wide", color)}>
                {label}
            </p>
            <pre className={cn(
                "text-xs rounded-lg p-3 overflow-auto max-h-56 whitespace-pre-wrap break-words font-mono",
                "border",
                bgColor
            )}>
                {hasValue ? prettyJson(value) : <span className="text-muted-foreground italic">No data</span>}
            </pre>
        </div>
    );
}

interface AuditDiffViewerProps {
    previousValue?: unknown;
    newValue?: unknown;
}

export function AuditDiffViewer({ previousValue, newValue }: AuditDiffViewerProps) {
    const hasDiff = previousValue !== undefined || newValue !== undefined;
    const [open, setOpen] = useState(false);

    if (!hasDiff) return null;

    return (
        <div className="mt-2">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
                {open
                    ? <ChevronDown className="w-3.5 h-3.5" />
                    : <ChevronRight className="w-3.5 h-3.5" />
                }
                {open ? "Hide diff" : "Show diff"}
            </button>

            {open && (
                <div className="mt-3 flex flex-col sm:flex-row gap-3">
                    <DiffPanel
                        label="Previous"
                        value={previousValue}
                        color="text-red-600 dark:text-red-400"
                        bgColor="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/40"
                    />
                    <DiffPanel
                        label="New"
                        value={newValue}
                        color="text-green-600 dark:text-green-400"
                        bgColor="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/40"
                    />
                </div>
            )}
        </div>
    );
}