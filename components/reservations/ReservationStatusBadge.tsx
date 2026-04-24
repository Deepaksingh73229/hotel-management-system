import { cn } from "@/lib/utils";
import { RESERVATION_STATUS_META, type ReservationStatus } from "@/types/reservation.types";

const VARIANT_STYLES: Record<string, string> = {
    blue: "bg-blue-100   text-blue-700   border-blue-200   dark:bg-blue-900/30   dark:text-blue-400   dark:border-blue-800",
    green: "bg-green-100  text-green-700  border-green-200  dark:bg-green-900/30  dark:text-green-400  dark:border-green-800",
    gray: "bg-gray-100   text-gray-600   border-gray-200   dark:bg-gray-800      dark:text-gray-400   dark:border-gray-700",
    red: "bg-red-100    text-red-700    border-red-200    dark:bg-red-900/30    dark:text-red-400    dark:border-red-800",
    orange: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
    purple: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
};

interface Props { status: ReservationStatus; className?: string; }

export function ReservationStatusBadge({ status, className }: Props) {
    const meta = RESERVATION_STATUS_META[status];
    if (!meta) return null;

    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
            VARIANT_STYLES[meta.variant],
            className
        )}>
            {meta.dot && (
                <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                </span>
            )}
            {meta.label}
        </span>
    );
}