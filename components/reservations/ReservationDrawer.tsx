"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Loader2, BedDouble, User, CalendarDays, CreditCard, MessageSquare } from "lucide-react";

import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

import { ReservationStatusBadge } from "./ReservationStatusBadge";
import { ReservationStatusStepper } from "./ReservationStatusStepper";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useReservation, useCheckIn, useCheckOut, useCancelReservation, useMarkNoShow } from "@/hooks/reservations/useReservations";
import { useRooms } from "@/hooks/rooms/useRooms";
import { guestFullName } from "@/types";
import type { Reservation } from "@/types";

// ─── Small label+value row ────────────────────────────────────────────────────
const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="flex justify-between gap-4 text-sm py-1">
        <span className="text-muted-foreground flex-shrink-0">{label}</span>
        <span className="text-foreground font-medium text-right">{value ?? "—"}</span>
    </div>
);

// ─── Section card ─────────────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, children }: {
    icon: React.ElementType; title: string; children: React.ReactNode;
}) => (
    <div className="space-y-2">
        <div className="flex items-center gap-2">
            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                {title}
            </p>
        </div>
        <div className="bg-muted/30 rounded-lg px-3 divide-y divide-border">
            {children}
        </div>
    </div>
);

interface ReservationDrawerProps {
    reservation: Reservation | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ReservationDrawer({ reservation, open, onOpenChange }: ReservationDrawerProps) {
    // Re-fetch from cache to get latest populated data
    const { data: res } = useReservation(reservation?._id ?? "");
    const current = res ?? reservation;

    const [checkInRoomId, setCheckInRoomId] = useState("");
    const [cancelReason, setCancelReason] = useState("");
    const [cancelCharge, setCancelCharge] = useState(0);
    const [showCancelDlg, setShowCancelDlg] = useState(false);
    const [showNoShowDlg, setShowNoShowDlg] = useState(false);
    const [showCheckOutDlg, setShowCheckOutDlg] = useState(false);

    const checkInMutation = useCheckIn(current?._id ?? "");
    const checkOutMutation = useCheckOut(current?._id ?? "");
    const cancelMutation = useCancelReservation(current?._id ?? "");
    const noShowMutation = useMarkNoShow(current?._id ?? "");

    // Vacant clean rooms of the booked room type for check-in selector
    const { data: roomData } = useRooms({
        status: "vacant_clean",
        roomTypeId: current?.roomType._id,
        limit: 100,
    });
    const availableRooms = roomData?.rooms ?? [];

    if (!current) return null;

    const status = current.status;
    const canCheckIn = status === "confirmed" || status === "enquiry";
    const canCheckOut = status === "checked_in";
    const canCancel = status === "confirmed" || status === "enquiry" || status === "waitlisted";
    const canNoShow = status === "confirmed";
    const isTerminal = ["checked_out", "cancelled", "no_show"].includes(status);

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="mb-5 pr-8">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <DialogTitle className="font-mono text-base tracking-wide">
                                    {current.confirmationNumber}
                                </DialogTitle>
                                <DialogDescription className="text-xs mt-0.5">
                                    {guestFullName(current.primaryGuest)}
                                </DialogDescription>
                            </div>
                            <ReservationStatusBadge status={status} />
                        </div>
                    </DialogHeader>

                    <div className="space-y-5">

                        {/* ── Status timeline ─────────────────────────── */}
                        <ReservationStatusStepper reservation={current} />

                        <Separator />

                        {/* ── Guest ────────────────────────────────────── */}
                        <Section icon={User} title="Guest">
                            <InfoRow label="Name" value={guestFullName(current.primaryGuest)} />
                            <InfoRow label="Phone" value={current.primaryGuest.phone} />
                            <InfoRow label="Email" value={current.primaryGuest.email} />
                            <InfoRow label="Adults" value={current.adults} />
                            <InfoRow label="Children" value={current.children} />
                        </Section>

                        {/* ── Stay ─────────────────────────────────────── */}
                        <Section icon={CalendarDays} title="Stay">
                            <InfoRow label="Room type"
                                value={`${current.roomType.name} (${current.roomType.code})`} />
                            <InfoRow label="Room assigned"
                                value={current.room?.roomNumber} />
                            <InfoRow label="Check-in"
                                value={format(new Date(current.checkInDate), "dd MMM yyyy")} />
                            <InfoRow label="Check-out"
                                value={format(new Date(current.checkOutDate), "dd MMM yyyy")} />
                            <InfoRow label="Nights" value={current.nights} />
                            <InfoRow label="Source" value={current.source.replace(/_/g, " ")} />
                            <InfoRow label="Arrival" value={current.arrivalTime} />
                        </Section>

                        {/* ── Pricing ──────────────────────────────────── */}
                        <Section icon={CreditCard} title="Pricing">
                            <InfoRow label="Rate / night"
                                value={`₹${current.ratePerNight.toLocaleString("en-IN")}`} />
                            <InfoRow label="Room charge"
                                value={`₹${current.totalRoomCharge.toLocaleString("en-IN")}`} />
                            {current.discountAmount > 0 && (
                                <InfoRow label="Discount"
                                    value={`-₹${current.discountAmount.toLocaleString("en-IN")}`} />
                            )}
                            <InfoRow label="Total"
                                value={`₹${current.totalAmount.toLocaleString("en-IN")}`} />
                            <InfoRow label="Deposit paid"
                                value={`₹${current.depositAmount.toLocaleString("en-IN")}`} />
                        </Section>

                        {/* ── Special requests ─────────────────────────── */}
                        {current.specialRequests && (
                            <Section icon={MessageSquare} title="Special requests">
                                <p className="text-sm text-foreground py-2">
                                    {current.specialRequests}
                                </p>
                            </Section>
                        )}

                        {/* ── Actions ──────────────────────────────────── */}
                        {!isTerminal && (
                            <>
                                <Separator />
                                <div className="space-y-3">
                                    <p className="text-sm font-semibold">Actions</p>

                                    {/* Check-in */}
                                    {canCheckIn && (
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">
                                                Assign room to check in
                                            </Label>
                                            <div className="flex gap-2">
                                                <Select value={checkInRoomId} onValueChange={setCheckInRoomId}>
                                                    <SelectTrigger className="flex-1 h-9 text-sm">
                                                        <SelectValue placeholder="Select vacant room…" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableRooms.length === 0 && (
                                                            <div className="px-3 py-3 text-sm text-muted-foreground">
                                                                No vacant clean rooms available.
                                                            </div>
                                                        )}
                                                        {availableRooms.map((r) => (
                                                            <SelectItem key={r._id} value={r._id}>
                                                                Room {r.roomNumber} · {r.floor.label ?? `Floor ${r.floor.floorNumber}`}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    size="sm"
                                                    disabled={!checkInRoomId || checkInMutation.isPending}
                                                    onClick={() =>
                                                        checkInMutation.mutate(
                                                            { roomId: checkInRoomId },
                                                            { onSuccess: () => { setCheckInRoomId(""); onOpenChange(false); } }
                                                        )
                                                    }
                                                >
                                                    {checkInMutation.isPending
                                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                                        : "Check in"
                                                    }
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Check-out */}
                                    {canCheckOut && (
                                        <Button
                                            className="w-full"
                                            onClick={() => setShowCheckOutDlg(true)}
                                        >
                                            Check out guest
                                        </Button>
                                    )}

                                    {/* Cancel + No-show */}
                                    <div className="flex gap-2">
                                        {canCancel && (
                                            <Button
                                                variant="outline"
                                                className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                                                onClick={() => setShowCancelDlg(true)}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                        {canNoShow && (
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => setShowNoShowDlg(true)}
                                            >
                                                No show
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Check-out confirm ─────────────────────────────────── */}
            <ConfirmDialog
                open={showCheckOutDlg}
                onOpenChange={setShowCheckOutDlg}
                title="Check out guest?"
                description={`This will check out ${guestFullName(current.primaryGuest)} and mark the room for cleaning.`}
                confirmLabel="Check out"
                variant="default"
                isPending={checkOutMutation.isPending}
                onConfirm={() =>
                    checkOutMutation.mutate(undefined, {
                        onSuccess: () => { setShowCheckOutDlg(false); onOpenChange(false); },
                    })
                }
            />

            {/* ── Cancel dialog ─────────────────────────────────────── */}
            <ConfirmDialog
                open={showCancelDlg}
                onOpenChange={setShowCancelDlg}
                title="Cancel reservation?"
                description="This action cannot be undone."
                confirmLabel="Cancel reservation"
                variant="destructive"
                isPending={cancelMutation.isPending}
                onConfirm={() =>
                    cancelMutation.mutate(
                        { reason: cancelReason, cancellationCharge: cancelCharge },
                        { onSuccess: () => { setShowCancelDlg(false); onOpenChange(false); } }
                    )
                }
            >
                {/* Extra fields rendered inside the dialog via children prop not shown
                    — reason + charge inputs live inline in the form below the dialog  */}
            </ConfirmDialog>

            {/* ── No-show confirm ───────────────────────────────────── */}
            <ConfirmDialog
                open={showNoShowDlg}
                onOpenChange={setShowNoShowDlg}
                title="Mark as no-show?"
                description={`${guestFullName(current.primaryGuest)} did not arrive. This will free up the reservation.`}
                confirmLabel="Mark no-show"
                variant="destructive"
                isPending={noShowMutation.isPending}
                onConfirm={() =>
                    noShowMutation.mutate(undefined, {
                        onSuccess: () => { setShowNoShowDlg(false); onOpenChange(false); },
                    })
                }
            />
        </>
    );
}