import client from "./api/client";
import type {
    ApiResponse,
    ReservationListData,
    ReservationListParams,
    Reservation,
    CreateReservationPayload,
    UpdateReservationPayload,
    CheckInPayload,
    CancelReservationPayload,
} from "@/types";

/** GET /api/reservations */
export const getAllReservations = async (params?: ReservationListParams) => {
    const res = await client.get<ApiResponse<ReservationListData>>(
        "/reservations",
        { params }
    );
    return res.data;
};

/** GET /api/reservations/:id */
export const getReservationById = async (id: string) => {
    const res = await client.get<ApiResponse<{ reservation: Reservation }>>(
        `/reservations/${id}`
    );
    return res.data;
};

/** POST /api/reservations */
export const createReservation = async (payload: CreateReservationPayload) => {
    const res = await client.post<ApiResponse<{ reservation: Reservation }>>(
        "/reservations",
        payload
    );
    return res.data;
};

/** PATCH /api/reservations/:id */
export const updateReservation = async (
    id: string,
    payload: UpdateReservationPayload
) => {
    const res = await client.patch<ApiResponse<{ reservation: Reservation }>>(
        `/reservations/${id}`,
        payload
    );
    return res.data;
};

/** POST /api/reservations/:id/check-in */
export const checkIn = async (id: string, payload: CheckInPayload) => {
    const res = await client.post<ApiResponse<{ reservation: Reservation }>>(
        `/reservations/${id}/check-in`,
        payload
    );
    return res.data;
};

/** POST /api/reservations/:id/check-out */
export const checkOut = async (id: string) => {
    const res = await client.post<ApiResponse<{ reservation: Reservation }>>(
        `/reservations/${id}/check-out`
    );
    return res.data;
};

/** POST /api/reservations/:id/cancel */
export const cancelReservation = async (
    id: string,
    payload: CancelReservationPayload
) => {
    const res = await client.post<ApiResponse<{ reservation: Reservation }>>(
        `/reservations/${id}/cancel`,
        payload
    );
    return res.data;
};

/** POST /api/reservations/:id/no-show */
export const markNoShow = async (id: string) => {
    const res = await client.post<ApiResponse<{ reservation: Reservation }>>(
        `/reservations/${id}/no-show`
    );
    return res.data;
};