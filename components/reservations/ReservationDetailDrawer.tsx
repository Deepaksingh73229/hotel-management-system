"use client";

import { format } from "date-fns";
import {
    User, CalendarDays, CreditCard,
    MessageSquare,
} from "lucide-react";

import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { ReservationStatusBadge } from "./ReservationStatusBadge";
import { ReservationStatusStepper } from "./ReservationStatusStepper";
import { ReservationActionsPanel } from "./ReservationActionsPanel";

import { useReservation } from "@/hooks/reservations/useReservations";
import { guestFullName } from "@/types";

// ─── Info row ─────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="flex justify-between gap-4 text-sm py-1.5 border-b border-border/50 last:border-0">
        <span className="text-muted-foreground shrink-0">{label}</span>
        <span className="text-foreground font-medium text-right">{value ?? "—"}</span>
    </div>
);

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, children }: {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
}) => (
    <div className="space-y-2">
        <div className="flex items-center gap-2">
            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                {title}
            </p>
        </div>
        <div className="bg-muted/20 rounded-xl px-4 py-1">
            {children}
        </div>
    </div>
);

interface Props {
    reservationId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ReservationDetailDrawer({ reservationId, open, onOpenChange }: Props) {
    const { data, isLoading } = useReservation(reservationId ?? "");
    const reservation = data?.reservation;
    const statusHistory = data?.statusHistory ?? [];
    const hasReservation = Boolean(reservation);
    const headerDescription = reservation
        ? guestFullName(reservation.primaryGuest)
        : "Review reservation details and actions";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader className={hasReservation ? "mb-5 pr-8" : "sr-only"}>
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <DialogTitle className={hasReservation ? "font-mono text-base tracking-wide" : undefined}>
                                {reservation?.confirmationNumber ?? "Reservation details"}
                            </DialogTitle>
                            <DialogDescription className="text-xs mt-0.5">
                                {headerDescription}
                            </DialogDescription>
                        </div>
                        {reservation && <ReservationStatusBadge status={reservation.status} />}
                    </div>
                </DialogHeader>

                {/* Loading */}
                {isLoading && (
                    <div className="space-y-4 p-1">
                        <Skeleton className="h-6 w-48 rounded" />
                        <Skeleton className="h-4 w-32 rounded" />
                        <Skeleton className="h-32 w-full rounded-xl" />
                        <Skeleton className="h-24 w-full rounded-xl" />
                    </div>
                )}

                {reservation && (
                    <>
                        <div className="space-y-5">

                            {/* Status stepper */}
                            <ReservationStatusStepper
                                reservation={reservation}
                                statusHistory={statusHistory}
                            />

                            <Separator />

                            {/* Guest */}
                            <Section icon={User} title="Guest">
                                <InfoRow label="Name" value={guestFullName(reservation.primaryGuest)} />
                                <InfoRow label="Phone" value={reservation.primaryGuest.phone} />
                                <InfoRow label="Email" value={reservation.primaryGuest.email} />
                                <InfoRow label="Adults" value={reservation.adults} />
                                <InfoRow label="Children" value={reservation.children} />
                            </Section>

                            {/* Stay */}
                            <Section icon={CalendarDays} title="Stay">
                                <InfoRow
                                    label="Room type"
                                    value={`${reservation.roomType.name} (${reservation.roomType.code})`}
                                />
                                <InfoRow
                                    label="Room"
                                    value={(reservation.room as any)?.roomNumber}
                                />
                                <InfoRow
                                    label="Check-in"
                                    value={format(new Date(reservation.checkInDate), "dd MMM yyyy")}
                                />
                                <InfoRow
                                    label="Check-out"
                                    value={format(new Date(reservation.checkOutDate), "dd MMM yyyy")}
                                />
                                <InfoRow label="Nights" value={reservation.nights} />
                                <InfoRow
                                    label="Source"
                                    value={reservation.source.replace(/_/g, " ")}
                                />
                                <InfoRow label="Arrival time" value={reservation.arrivalTime} />
                            </Section>

                            {/* Pricing */}
                            <Section icon={CreditCard} title="Pricing">
                                <InfoRow
                                    label="Rate / night"
                                    value={`₹${reservation.ratePerNight.toLocaleString("en-IN")}`}
                                />
                                <InfoRow
                                    label="Room charge"
                                    value={`₹${reservation.totalRoomCharge.toLocaleString("en-IN")}`}
                                />
                                {reservation.discountAmount > 0 && (
                                    <InfoRow
                                        label="Discount"
                                        value={`-₹${reservation.discountAmount.toLocaleString("en-IN")}`}
                                    />
                                )}
                                <InfoRow
                                    label="Total"
                                    value={`₹${reservation.totalAmount.toLocaleString("en-IN")}`}
                                />
                                <InfoRow
                                    label="Deposit paid"
                                    value={`₹${reservation.depositAmount.toLocaleString("en-IN")}`}
                                />
                            </Section>

                            {/* Special requests */}
                            {reservation.specialRequests && (
                                <Section icon={MessageSquare} title="Special requests">
                                    <p className="text-sm text-foreground py-2">
                                        {reservation.specialRequests}
                                    </p>
                                </Section>
                            )}

                            {/* Cancellation info */}
                            {reservation.status === "cancelled" && (
                                <div className="rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/40 px-4 py-3 space-y-1">
                                    <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
                                        Cancellation
                                    </p>
                                    <p className="text-sm text-foreground">{reservation.cancellationReason}</p>
                                    {reservation.cancellationCharge != null && reservation.cancellationCharge > 0 && (
                                        <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                            Charge: ₹{reservation.cancellationCharge.toLocaleString("en-IN")}
                                        </p>
                                    )}
                                </div>
                            )}

                            <Separator />

                            {/* Lifecycle actions */}
                            <div>
                                <p className="text-sm font-semibold mb-3">Actions</p>
                                <ReservationActionsPanel
                                    reservation={reservation}
                                    onActionDone={() => onOpenChange(false)}
                                />
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}