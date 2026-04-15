import { Check, Circle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
    STATUS_LIFECYCLE,
    RESERVATION_STATUS_META,
    type Reservation,
    type ReservationStatus,
} from "@/types";

// Map each lifecycle status to its timestamp on the reservation
const STATUS_TIMESTAMPS: Partial<Record<ReservationStatus, (r: Reservation) => string | undefined>> = {
    confirmed: (r) => r.createdAt,
    checked_in: (r) => r.actualCheckInAt,
    checked_out: (r) => r.actualCheckOutAt,
    cancelled: (r) => r.cancelledAt,
};

interface ReservationStatusStepperProps {
    reservation: Reservation;
}

export function ReservationStatusStepper({ reservation }: ReservationStatusStepperProps) {
    const currentStatus = reservation.status;

    // Handle terminal statuses not in the main lifecycle
    const isTerminal = ["cancelled", "no_show"].includes(currentStatus);

    const currentIndex = STATUS_LIFECYCLE.indexOf(
        isTerminal ? "confirmed" : currentStatus
    );

    return (
        <div className="space-y-0">
            {STATUS_LIFECYCLE.map((status, index) => {
                const meta = RESERVATION_STATUS_META[status];
                const isDone = index < currentIndex || (index === currentIndex && !isTerminal);
                const isCurrent = index === currentIndex && !isTerminal;
                const isFuture = index > currentIndex || isTerminal;
                const tsGetter = STATUS_TIMESTAMPS[status];
                const timestamp = tsGetter ? tsGetter(reservation) : undefined;

                return (
                    <div key={status} className="flex gap-3">
                        {/* ── Left column: dot + line ─────────────────── */}
                        <div className="flex flex-col items-center">
                            <div className={cn(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10",
                                isDone
                                    ? "bg-primary border-primary"
                                    : isCurrent
                                        ? "bg-background border-primary"
                                        : "bg-background border-border"
                            )}>
                                {isDone
                                    ? <Check className="w-3 h-3 text-primary-foreground" />
                                    : isCurrent
                                        ? <Circle className="w-2 h-2 fill-primary text-primary" />
                                        : null
                                }
                            </div>
                            {/* Connector line — not shown after last item */}
                            {index < STATUS_LIFECYCLE.length - 1 && (
                                <div className={cn(
                                    "w-0.5 flex-1 my-1 min-h-[24px]",
                                    index < currentIndex ? "bg-primary" : "bg-border"
                                )} />
                            )}
                        </div>

                        {/* ── Right column: label + timestamp ─────────── */}
                        <div className="pb-5 min-w-0">
                            <p className={cn(
                                "text-sm font-medium leading-tight",
                                isFuture
                                    ? "text-muted-foreground"
                                    : "text-foreground"
                            )}>
                                {meta.label}
                            </p>
                            {timestamp && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {format(new Date(timestamp), "dd MMM yyyy, HH:mm")}
                                </p>
                            )}
                            {/* Cancellation note */}
                            {status === "confirmed" && isTerminal && (
                                <p className={cn(
                                    "text-xs mt-1 font-medium",
                                    currentStatus === "cancelled"
                                        ? "text-red-600 dark:text-red-400"
                                        : "text-orange-600 dark:text-orange-400"
                                )}>
                                    {RESERVATION_STATUS_META[currentStatus].label}
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