"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import * as guestService from "@/services/guest.service";
import type { GuestListParams, CreateGuestPayload, UpdateGuestPayload } from "@/types";

// ─── Query keys ───────────────────────────────────────────────────────────────
export const guestKeys = {
    all: ["guests"] as const,
    list: (params?: GuestListParams) => ["guests", "list", params] as const,
    detail: (id: string) => ["guests", "detail", id] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// LIST
// ─────────────────────────────────────────────────────────────────────────────

export function useGuests(params?: GuestListParams) {
    return useQuery({
        queryKey: guestKeys.list(params),
        queryFn: () => guestService.getAllGuests(params),
        select: (res) => res.data,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// SINGLE
// ─────────────────────────────────────────────────────────────────────────────

export function useGuest(id: string) {
    return useQuery({
        queryKey: guestKeys.detail(id),
        queryFn: () => guestService.getGuestById(id),
        select: (res) => res.data.guest,
        enabled: !!id,
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

export function useCreateGuest() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateGuestPayload) => guestService.createGuest(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: guestKeys.all });
            toast.success("Guest profile created.");
        },
        onError: (err: Error) => {
            toast.error(err.message ?? "Failed to create guest.");
        },
    });
}

export function useUpdateGuest(id: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateGuestPayload) => guestService.updateGuest(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: guestKeys.all });
            qc.invalidateQueries({ queryKey: guestKeys.detail(id) });
            toast.success("Guest profile updated.");
        },
        onError: (err: Error) => {
            toast.error(err.message ?? "Failed to update guest.");
        },
    });
}

export function useDeactivateGuest() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => guestService.deactivateGuest(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: guestKeys.all });
            toast.success("Guest profile deactivated.");
        },
        onError: (err: Error) => {
            toast.error(err.message ?? "Failed to deactivate guest.");
        },
    });
}