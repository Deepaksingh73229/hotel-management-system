import { format } from "date-fns";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    STATUS_LIFECYCLE,
    RESERVATION_STATUS_META,
    type Reservation,
    type ReservationStatus,
} from "@/types/reservation.types";
import type { StatusHistoryEntry } from "@/services/reservation.service";

// Map lifecycle status → timestamp field
const TIMESTAMPS: Partial<Record<ReservationStatus, (r: Reservation) => string | undefined>> = {
    enquiry: (r) => r.createdAt,
    confirmed: (r) => r.createdAt,
    checked_in: (r) => r.actualCheckInAt,
    checked_out: (r) => r.actualCheckOutAt,
};

interface Props {
    reservation: Reservation;
    statusHistory: StatusHistoryEntry[];
}

export function ReservationStatusStepper({ reservation, statusHistory }: Props) {
    const current = reservation.status;
    const isTerminal = ["cancelled", "no_show"].includes(current);
    const currentIndex = STATUS_LIFECYCLE.indexOf(
        isTerminal ? "confirmed" : (current as ReservationStatus)
    );

    return (
        <div className="space-y-0">
            {STATUS_LIFECYCLE.map((status, index) => {
                const meta = RESERVATION_STATUS_META[status];
                const isDone = index < currentIndex || (index === currentIndex && !isTerminal);
                const isCurrent = index === currentIndex && !isTerminal;
                const isFuture = index > currentIndex || isTerminal;
                const ts = TIMESTAMPS[status]?.(reservation);

                // Find the history entry for this status
                const histEntry = statusHistory.find((h) => h.toStatus === status);

                return (
                    <div key={status} className="flex gap-3">
                        {/* Dot + connector */}
                        <div className="flex flex-col items-center">
                            <div className={cn(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                                isDone ? "bg-primary border-primary" :
                                    isCurrent ? "bg-background border-primary" :
                                        "bg-background border-border"
                            )}>
                                {isDone
                                    ? <Check className="w-3 h-3 text-primary-foreground" />
                                    : isCurrent
                                        ? <Circle className="w-2 h-2 fill-primary text-primary" />
                                        : null
                                }
                            </div>
                            {index < STATUS_LIFECYCLE.length - 1 && (
                                <div className={cn(
                                    "w-0.5 flex-1 my-1 min-h-[24px]",
                                    index < currentIndex ? "bg-primary" : "bg-border"
                                )} />
                            )}
                        </div>

                        {/* Label + meta */}
                        <div className="pb-5 min-w-0">
                            <p className={cn(
                                "text-sm font-medium leading-tight",
                                isFuture ? "text-muted-foreground" : "text-foreground"
                            )}>
                                {meta.label}
                            </p>
                            {ts && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {format(new Date(ts), "dd MMM yyyy, HH:mm")}
                                </p>
                            )}
                            {histEntry?.changedBy && (
                                <p className="text-xs text-muted-foreground/70 mt-0.5">
                                    by {histEntry.changedBy.name}
                                </p>
                            )}
                            {/* Terminal status branch */}
                            {status === "confirmed" && isTerminal && (
                                <p className={cn(
                                    "text-xs mt-1 font-medium",
                                    current === "cancelled"
                                        ? "text-red-600 dark:text-red-400"
                                        : "text-orange-600 dark:text-orange-400"
                                )}>
                                    {RESERVATION_STATUS_META[current as ReservationStatus].label}
                                    {reservation.cancellationReason && ` · ${reservation.cancellationReason}`}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}