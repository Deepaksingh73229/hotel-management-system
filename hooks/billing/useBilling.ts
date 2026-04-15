"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import * as billingService from "@/services/billing.service";
import type {
    FolioListParams,
    PostChargePayload,
    AddPaymentPayload,
    VoidChargePayload,
    GenerateInvoicePayload,
} from "@/types";

// ─── Query keys ───────────────────────────────────────────────────────────────
export const billingKeys = {
    all:             ["folios"]                                      as const,
    list:            (p?: FolioListParams) => ["folios", "list", p] as const,
    detail:          (id: string)         => ["folios", "detail", id] as const,
    byReservation:   (rid: string)        => ["folios", "reservation", rid] as const,
    invoice:         (fid: string)        => ["folios", "invoice", fid] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────────────────────────

export function useFolios(params?: FolioListParams) {
    return useQuery({
        queryKey: billingKeys.list(params),
        queryFn:  () => billingService.getAllFolios(params),
        select:   (res) => res.data,
    });
}

export function useFolio(id: string) {
    return useQuery({
        queryKey: billingKeys.detail(id),
        queryFn:  () => billingService.getFolioById(id),
        select:   (res) => res.data,
        enabled:  !!id,
    });
}

export function useFolioByReservation(reservationId: string) {
    return useQuery({
        queryKey: billingKeys.byReservation(reservationId),
        queryFn:  () => billingService.getFolioByReservation(reservationId),
        select:   (res) => res.data,
        enabled:  !!reservationId,
    });
}

export function useInvoice(folioId: string) {
    return useQuery({
        queryKey: billingKeys.invoice(folioId),
        queryFn:  () => billingService.getInvoice(folioId),
        select:   (res) => res.data.invoice,
        enabled:  !!folioId,
        retry:    false,   // 404 is expected when no invoice yet
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// CHARGE MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

export function usePostCharge(folioId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: PostChargePayload) =>
            billingService.postCharge(folioId, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: billingKeys.detail(folioId) });
            toast.success("Charge posted to folio.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to post charge."),
    });
}

export function useVoidCharge(folioId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ chargeId, payload }: { chargeId: string; payload: VoidChargePayload }) =>
            billingService.voidCharge(chargeId, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: billingKeys.detail(folioId) });
            toast.success("Charge voided.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to void charge."),
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

export function useAddPayment(folioId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: AddPaymentPayload) =>
            billingService.addPayment(folioId, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: billingKeys.detail(folioId) });
            toast.success("Payment recorded.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to record payment."),
    });
}

export function useVoidPayment(folioId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ paymentId, reason }: { paymentId: string; reason: string }) =>
            billingService.voidPayment(paymentId, reason),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: billingKeys.detail(folioId) });
            toast.success("Payment voided.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to void payment."),
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// INVOICE MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

export function useGenerateInvoice(folioId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: GenerateInvoicePayload) =>
            billingService.generateInvoice(folioId, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: billingKeys.invoice(folioId) });
            qc.invalidateQueries({ queryKey: billingKeys.detail(folioId) });
            toast.success("Invoice generated.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to generate invoice."),
    });
}