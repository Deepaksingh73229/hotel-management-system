import { cn } from "@/lib/utils";
import type { Folio } from "@/types";

interface FolioSummaryFooterProps {
    folio:      Folio;
    className?: string;
}

export function FolioSummaryFooter({ folio, className }: FolioSummaryFooterProps) {
    const balance  = folio.balance;
    const isCredit = balance <= 0;

    return (
        <div className={cn(
            "bg-muted/40 border border-border rounded-xl px-5 py-4 space-y-2",
            className
        )}>
            <Row label="Room charges + extras" value={folio.totalCharges} />
            <Row label="Tax"                   value={folio.totalTax} />

            <div className="border-t border-border my-2" />

            <Row label="Grand total"   value={folio.totalCharges + folio.totalTax} bold />
            <Row label="Amount paid"   value={folio.totalPayments} />

            <div className="border-t border-border my-2" />

            <div className="flex items-center justify-between">
                <span className={cn(
                    "text-sm font-semibold",
                    isCredit ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}>
                    {isCredit ? "Credit / Advance" : "Balance due"}
                </span>
                <span className={cn(
                    "text-lg font-bold",
                    isCredit ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}>
                    ₹{Math.abs(balance).toLocaleString("en-IN")}
                </span>
            </div>
        </div>
    );
}

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <span className={cn(
                "text-sm",
                bold ? "font-semibold text-foreground" : "text-muted-foreground"
            )}>
                {label}
            </span>
            <span className={cn(
                "text-sm",
                bold ? "font-semibold text-foreground" : "text-foreground"
            )}>
                ₹{value.toLocaleString("en-IN")}
            </span>
        </div>
    );
}