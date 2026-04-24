"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import * as reservationService from "@/services/reservation.service";
import type {
    ReservationListParams,
    CreateReservationPayload,
    UpdateReservationPayload,
    AssignRoomPayload,
    CheckInPayload,
    CheckOutPayload,
    CancelPayload,
    NoShowPayload,
    ArrivalDepartureParams,
} from "@/services/reservation.service";

// ─── Query keys ───────────────────────────────────────────────────────────────
export const reservationKeys = {
    all: ["reservations"] as const,
    list: (p?: ReservationListParams) => ["reservations", "list", p] as const,
    detail: (id: string) => ["reservations", "detail", id] as const,
    history: (id: string) => ["reservations", "history", id] as const,
    arrivals: (p?: ArrivalDepartureParams) => ["reservations", "arrivals", p] as const,
    departures: (p?: ArrivalDepartureParams) => ["reservations", "departures", p] as const,
    inHouse: ["reservations", "in-house"] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────────────────────────

export function useReservations(params?: ReservationListParams) {
    return useQuery({
        queryKey: reservationKeys.list(params),
        queryFn: () => reservationService.getReservations(params),
        select: (res) => res.data,
        staleTime: 1000 * 30,
    });
}

export function useReservation(id: string) {
    return useQuery({
        queryKey: reservationKeys.detail(id),
        queryFn: () => reservationService.getReservationById(id),
        select: (res) => res.data,
        enabled: !!id,
        staleTime: 1000 * 30,
    });
}

export function useStatusHistory(id: string) {
    return useQuery({
        queryKey: reservationKeys.history(id),
        queryFn: () => reservationService.getStatusHistory(id),
        select: (res) => res.data,
        enabled: !!id,
    });
}

export function useArrivals(params?: ArrivalDepartureParams) {
    return useQuery({
        queryKey: reservationKeys.arrivals(params),
        queryFn: () => reservationService.getArrivals(params),
        select: (res) => res.data,
        staleTime: 1000 * 60,
    });
}

export function useDepartures(params?: ArrivalDepartureParams) {
    return useQuery({
        queryKey: reservationKeys.departures(params),
        queryFn: () => reservationService.getDepartures(params),
        select: (res) => res.data,
        staleTime: 1000 * 60,
    });
}

export function useInHouseGuests() {
    return useQuery({
        queryKey: reservationKeys.inHouse,
        queryFn: () => reservationService.getInHouseGuests(),
        select: (res) => res.data,
        staleTime: 1000 * 60,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

function invalidateAll(qc: ReturnType<typeof useQueryClient>, id?: string) {
    qc.invalidateQueries({ queryKey: reservationKeys.all });
    qc.invalidateQueries({ queryKey: reservationKeys.inHouse });
    qc.invalidateQueries({ queryKey: ["rooms"] });
    if (id) qc.invalidateQueries({ queryKey: reservationKeys.detail(id) });
}

export function useCreateReservation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (p: CreateReservationPayload) =>
            reservationService.createReservation(p),
        onSuccess: (res) => {
            invalidateAll(qc);
            toast.success(
                `Reservation ${res.data.reservation.confirmationNumber} created.`
            );
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to create reservation."),
    });
}

export function useUpdateReservation(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (p: UpdateReservationPayload) =>
            reservationService.updateReservation(id, p),
        onSuccess: () => {
            invalidateAll(qc, id);
            toast.success("Reservation updated.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to update."),
    });
}

export function useAssignRoom(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (p: AssignRoomPayload) => reservationService.assignRoom(id, p),
        onSuccess: (res) => {
            invalidateAll(qc, id);
            toast.success(`Room assigned to ${res.data.reservation.confirmationNumber}.`);
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to assign room."),
    });
}

export function useCheckIn(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (p: CheckInPayload) => reservationService.checkIn(id, p),
        onSuccess: (res) => {
            invalidateAll(qc, id);
            toast.success(`Checked in → Room ${res.data.room.roomNumber}`);
        },
        onError: (err: Error) => toast.error(err.message ?? "Check-in failed."),
    });
}

export function useCheckOut(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (p?: CheckOutPayload) => reservationService.checkOut(id, p),
        onSuccess: () => {
            invalidateAll(qc, id);
            toast.success("Guest checked out successfully.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Check-out failed."),
    });
}

export function useCancelReservation(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (p: CancelPayload) => reservationService.cancelReservation(id, p),
        onSuccess: (res) => {
            invalidateAll(qc, id);
            const charge = res.data.cancellationCharge;
            toast.success(
                charge > 0
                    ? `Cancelled. Charge: ₹${charge.toLocaleString("en-IN")}`
                    : "Reservation cancelled."
            );
        },
        onError: (err: Error) => toast.error(err.message ?? "Cancellation failed."),
    });
}

export function useMarkNoShow(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (p?: NoShowPayload) => reservationService.markNoShow(id, p),
        onSuccess: () => {
            invalidateAll(qc, id);
            toast.success("Marked as no-show.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to mark no-show."),
    });
}