"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import * as reservationService from "@/services/reservation.service";
import type {
    ReservationListParams,
    CreateReservationPayload,
    UpdateReservationPayload,
    CheckInPayload,
    CancelReservationPayload,
} from "@/types";

// ─── Query keys ───────────────────────────────────────────────────────────────
export const reservationKeys = {
    all: ["reservations"] as const,
    list: (p?: ReservationListParams) => ["reservations", "list", p] as const,
    detail: (id: string) => ["reservations", "detail", id] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────────────────────────

export function useReservations(params?: ReservationListParams) {
    return useQuery({
        queryKey: reservationKeys.list(params),
        queryFn: () => reservationService.getAllReservations(params),
        select: (res) => res.data,
    });
}

export function useReservation(id: string) {
    return useQuery({
        queryKey: reservationKeys.detail(id),
        queryFn: () => reservationService.getReservationById(id),
        select: (res) => res.data.reservation,
        enabled: !!id,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

export function useCreateReservation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (p: CreateReservationPayload) =>
            reservationService.createReservation(p),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: reservationKeys.all });
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
            qc.invalidateQueries({ queryKey: reservationKeys.all });
            qc.invalidateQueries({ queryKey: reservationKeys.detail(id) });
            toast.success("Reservation updated.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to update reservation."),
    });
}

export function useCheckIn(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (p: CheckInPayload) => reservationService.checkIn(id, p),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: reservationKeys.all });
            qc.invalidateQueries({ queryKey: reservationKeys.detail(id) });
            // Also refresh rooms since the room status changes on check-in
            qc.invalidateQueries({ queryKey: ["rooms"] });
            toast.success(
                `Checked in — Room ${res.data.reservation.room?.roomNumber ?? ""}`
            );
        },
        onError: (err: Error) => toast.error(err.message ?? "Check-in failed."),
    });
}

export function useCheckOut(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => reservationService.checkOut(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: reservationKeys.all });
            qc.invalidateQueries({ queryKey: reservationKeys.detail(id) });
            qc.invalidateQueries({ queryKey: ["rooms"] });
            toast.success("Checked out successfully.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Check-out failed."),
    });
}

export function useCancelReservation(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (p: CancelReservationPayload) =>
            reservationService.cancelReservation(id, p),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: reservationKeys.all });
            qc.invalidateQueries({ queryKey: reservationKeys.detail(id) });
            toast.success("Reservation cancelled.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Cancellation failed."),
    });
}

export function useMarkNoShow(id: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => reservationService.markNoShow(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: reservationKeys.all });
            qc.invalidateQueries({ queryKey: reservationKeys.detail(id) });
            toast.success("Reservation marked as no-show.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to mark no-show."),
    });
}