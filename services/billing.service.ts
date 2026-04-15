import client from "./api/client";
import type {
    ApiResponse,
    FolioListData,
    FolioListParams,
    FolioDetailData,
    FolioCharge,
    Payment,
    Invoice,
    PostChargePayload,
    AddPaymentPayload,
    VoidChargePayload,
    GenerateInvoicePayload,
} from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// FOLIO
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/folios */
export const getAllFolios = async (params?: FolioListParams) => {
    const res = await client.get<ApiResponse<FolioListData>>("/folios", { params });
    return res.data;
};

/**
 * GET /api/folios/:id
 * Returns folio + all charges + all payments in one call.
 */
export const getFolioById = async (id: string) => {
    const res = await client.get<ApiResponse<FolioDetailData>>(`/folios/${id}`);
    return res.data;
};

/**
 * GET /api/reservations/:reservationId/folio
 * Convenience — fetch the folio for a specific reservation.
 */
export const getFolioByReservation = async (reservationId: string) => {
    const res = await client.get<ApiResponse<FolioDetailData>>(
        `/reservations/${reservationId}/folio`
    );
    return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// CHARGES
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/folios/:id/charges */
export const postCharge = async (folioId: string, payload: PostChargePayload) => {
    const res = await client.post<ApiResponse<{ charge: FolioCharge }>>(
        `/folios/${folioId}/charges`,
        payload
    );
    return res.data;
};

/** DELETE /api/charges/:chargeId  (void, not hard delete) */
export const voidCharge = async (chargeId: string, payload: VoidChargePayload) => {
    const res = await client.patch<ApiResponse<{ charge: FolioCharge }>>(
        `/charges/${chargeId}/void`,
        payload
    );
    return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/folios/:id/payments */
export const addPayment = async (folioId: string, payload: AddPaymentPayload) => {
    const res = await client.post<ApiResponse<{ payment: Payment }>>(
        `/folios/${folioId}/payments`,
        payload
    );
    return res.data;
};

/** PATCH /api/payments/:paymentId/void */
export const voidPayment = async (paymentId: string, reason: string) => {
    const res = await client.patch<ApiResponse<{ payment: Payment }>>(
        `/payments/${paymentId}/void`,
        { reason }
    );
    return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// INVOICE
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/folios/:id/invoice */
export const generateInvoice = async (
    folioId: string,
    payload: GenerateInvoicePayload
) => {
    const res = await client.post<ApiResponse<{ invoice: Invoice }>>(
        `/folios/${folioId}/invoice`,
        payload
    );
    return res.data;
};

/** GET /api/folios/:id/invoice */
export const getInvoice = async (folioId: string) => {
    const res = await client.get<ApiResponse<{ invoice: Invoice }>>(
        `/folios/${folioId}/invoice`
    );
    return res.data;
};