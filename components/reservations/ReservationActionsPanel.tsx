"use client";

import { useState } from "react";
import { Loader2, BedDouble, LogIn, LogOut, XCircle, UserX, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Separator } from "@/components/ui/separator";

import {
    useCheckIn, useCheckOut,
    useCancelReservation, useMarkNoShow, useAssignRoom,
} from "@/hooks/reservations/useReservations";
import { useRooms } from "@/hooks/rooms/useRooms";
import type { Reservation } from "@/types/reservation.types";

interface Props {
    reservation: Reservation;
    onActionDone?: () => void;
}

export function ReservationActionsPanel({ reservation, onActionDone }: Props) {
    const status = reservation.status;

    const canAssign = ["confirmed", "enquiry"].includes(status);
    const canCheckIn = ["confirmed", "enquiry"].includes(status);
    const canCheckOut = status === "checked_in";
    const canCancel = ["confirmed", "enquiry", "waitlisted"].includes(status);
    const canNoShow = status === "confirmed";
    const isTerminal = ["checked_out", "cancelled", "no_show"].includes(status);

    if (isTerminal) return null;

    // ── Local state ──────────────────────────────────────────────────────────
    const [checkInRoomId, setCheckInRoomId] = useState("");
    const [cancelReason, setCancelReason] = useState("");
    const [waiveFee, setWaiveFee] = useState(false);
    const [noShowNotes, setNoShowNotes] = useState("");
    const [waiveNoShow, setWaiveNoShow] = useState(false);
    const [assignRoomId, setAssignRoomId] = useState("");
    const [showCancel, setShowCancel] = useState(false);
    const [showNoShow, setShowNoShow] = useState(false);
    const [showCheckOut, setShowCheckOut] = useState(false);

    // ── Mutations ────────────────────────────────────────────────────────────
    const checkInMutation = useCheckIn(reservation._id);
    const checkOutMutation = useCheckOut(reservation._id);
    const cancelMutation = useCancelReservation(reservation._id);
    const noShowMutation = useMarkNoShow(reservation._id);
    const assignMutation = useAssignRoom(reservation._id);

    // Available clean rooms for check-in
    const { data: roomData } = useRooms({
        status: "vacant_clean",
        roomTypeId: reservation.roomType._id,
        limit: 100,
    });
    const availableRooms = roomData?.rooms ?? [];

    const done = () => onActionDone?.();

    return (
        <div className="space-y-5">

            {/* ── Assign room ─────────────────────────────────────── */}
            {canAssign && !reservation.room && (
                <div className="space-y-2">
                    <p className="text-sm font-semibold">Assign room</p>
                    <div className="flex gap-2">
                        <Select value={assignRoomId} onValueChange={setAssignRoomId}>
                            <SelectTrigger className="flex-1 h-9 text-sm">
                                <SelectValue placeholder="Select a room…" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableRooms.length === 0 && (
                                    <div className="px-3 py-3 text-sm text-muted-foreground text-center">
                                        No vacant clean rooms available.
                                    </div>
                                )}
                                {availableRooms.map((r) => (
                                    <SelectItem key={r._id} value={r._id}>
                                        Room {r.roomNumber}
                                        <span className="text-muted-foreground ml-2">
                                            · {r.floor?.label ?? `Floor ${r.floor?.floorNumber}`}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={!assignRoomId || assignMutation.isPending}
                            onClick={() =>
                                assignMutation.mutate({ roomId: assignRoomId }, {
                                    onSuccess: () => { setAssignRoomId(""); done(); },
                                })
                            }
                        >
                            {assignMutation.isPending
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <><BedDouble className="w-4 h-4 mr-1.5" />Assign</>
                            }
                        </Button>
                    </div>
                </div>
            )}

            {/* ── Check-in ────────────────────────────────────────── */}
            {canCheckIn && (
                <>
                    {canAssign && !reservation.room && <Separator />}
                    <div className="space-y-2">
                        <p className="text-sm font-semibold">Check in</p>
                        {reservation.room ? (
                            /* Room already assigned — show confirmation */
                            <div className="flex items-center justify-between rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/40 px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                        Room {(reservation.room as any).roomNumber} assigned
                                    </p>
                                    <p className="text-xs text-green-600 dark:text-green-500">
                                        Ready to check in
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    disabled={checkInMutation.isPending}
                                    onClick={() =>
                                        checkInMutation.mutate(
                                            { roomId: (reservation.room as any)._id },
                                            { onSuccess: done }
                                        )
                                    }
                                >
                                    {checkInMutation.isPending
                                        ? <Loader2 className="w-4 h-4 animate-spin" />
                                        : <><LogIn className="w-4 h-4 mr-1.5" />Check in</>
                                    }
                                </Button>
                            </div>
                        ) : (
                            /* No room assigned — pick one during check-in */
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <Select value={checkInRoomId} onValueChange={setCheckInRoomId}>
                                        <SelectTrigger className="flex-1 h-9 text-sm">
                                            <SelectValue placeholder="Select vacant room to check in…" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableRooms.length === 0 && (
                                                <div className="px-3 py-3 text-sm text-muted-foreground text-center">
                                                    No vacant clean rooms for this room type.
                                                </div>
                                            )}
                                            {availableRooms.map((r) => (
                                                <SelectItem key={r._id} value={r._id}>
                                                    Room {r.roomNumber}
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
                                                { onSuccess: () => { setCheckInRoomId(""); done(); } }
                                            )
                                        }
                                    >
                                        {checkInMutation.isPending
                                            ? <Loader2 className="w-4 h-4 animate-spin" />
                                            : <><LogIn className="w-4 h-4 mr-1.5" />Check in</>
                                        }
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ── Check-out ────────────────────────────────────────── */}
            {canCheckOut && (
                <div className="space-y-2">
                    <p className="text-sm font-semibold">Check out</p>
                    <Button
                        className="w-full" variant="outline"
                        onClick={() => setShowCheckOut(true)}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Check out guest
                    </Button>
                </div>
            )}

            {/* ── Danger zone ─────────────────────────────────────── */}
            {(canCancel || canNoShow) && (
                <>
                    <Separator />
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-destructive flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4" />
                            Danger zone
                        </p>
                        <div className="flex gap-2">
                            {canCancel && (
                                <Button
                                    variant="outline"
                                    className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
                                    onClick={() => setShowCancel(true)}
                                >
                                    <XCircle className="w-4 h-4 mr-1.5" />
                                    Cancel
                                </Button>
                            )}
                            {canNoShow && (
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowNoShow(true)}
                                >
                                    <UserX className="w-4 h-4 mr-1.5" />
                                    No show
                                </Button>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* ── Check-out confirm ────────────────────────────────── */}
            <ConfirmDialog
                open={showCheckOut}
                onOpenChange={setShowCheckOut}
                title="Check out guest?"
                description={`This will check out the guest and mark the room for cleaning. Any outstanding balance must be settled first.`}
                confirmLabel="Check out"
                variant="default"
                isPending={checkOutMutation.isPending}
                onConfirm={() =>
                    checkOutMutation.mutate(undefined, {
                        onSuccess: () => { setShowCheckOut(false); done(); },
                    })
                }
            />

            {/* ── Cancel dialog ────────────────────────────────────── */}
            <ConfirmDialog
                open={showCancel}
                onOpenChange={setShowCancel}
                title="Cancel reservation?"
                description="Please provide a reason. A cancellation charge may apply."
                confirmLabel="Cancel reservation"
                variant="destructive"
                isPending={cancelMutation.isPending}
                onConfirm={() =>
                    cancelMutation.mutate(
                        { reason: cancelReason || "Cancelled by staff", waiveCancellationCharge: waiveFee },
                        { onSuccess: () => { setShowCancel(false); done(); } }
                    )
                }
            >
                <div className="space-y-3 py-2">
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Reason</Label>
                        <Textarea
                            placeholder="e.g. Guest requested cancellation"
                            rows={2}
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="text-sm resize-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch checked={waiveFee} onCheckedChange={setWaiveFee} />
                        <Label className="text-sm">Waive cancellation charge</Label>
                    </div>
                </div>
            </ConfirmDialog>

            {/* ── No-show dialog ───────────────────────────────────── */}
            <ConfirmDialog
                open={showNoShow}
                onOpenChange={setShowNoShow}
                title="Mark as no-show?"
                description="The guest did not arrive. A no-show charge may apply based on the rate plan."
                confirmLabel="Mark no-show"
                variant="destructive"
                isPending={noShowMutation.isPending}
                onConfirm={() =>
                    noShowMutation.mutate(
                        { notes: noShowNotes || undefined, waiveCharge: waiveNoShow },
                        { onSuccess: () => { setShowNoShow(false); done(); } }
                    )
                }
            >
                <div className="space-y-3 py-2">
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Notes (optional)</Label>
                        <Input
                            placeholder="Any notes…"
                            value={noShowNotes}
                            onChange={(e) => setNoShowNotes(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch checked={waiveNoShow} onCheckedChange={setWaiveNoShow} />
                        <Label className="text-sm">Waive no-show charge</Label>
                    </div>
                </div>
            </ConfirmDialog>
        </div>
    );
}