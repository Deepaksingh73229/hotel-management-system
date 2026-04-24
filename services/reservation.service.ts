import client from "./api/client";
import type { ApiResponse } from "@/types";
import type {
    Reservation,
    ReservationListData,
    ReservationStatus,
    ReservationSource,
} from "@/types/reservation.types";

// ─── Payload types ────────────────────────────────────────────────────────────

export interface CreateReservationPayload {
    primaryGuestId?: string;
    primaryGuest?: {                   // inline guest creation
        firstName: string;
        lastName: string;
        email?: string;
        phone?: string;
    };
    roomTypeId: string;
    roomId?: string;
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    children?: number;
    ratePlanId?: string;
    ratePerNight: number;
    discountAmount?: number;
    discountReason?: string;
    source: ReservationSource;
    otaBookingId?: string;
    agentId?: string;
    specialRequests?: string;
    internalNotes?: string;
    arrivalTime?: string;
    depositAmount?: number;
    depositPaymentMode?: string;
}

export interface UpdateReservationPayload {
    checkInDate?: string;
    checkOutDate?: string;
    adults?: number;
    children?: number;
    ratePlanId?: string;
    ratePerNight?: number;
    discountAmount?: number;
    discountReason?: string;
    specialRequests?: string;
    internalNotes?: string;
    arrivalTime?: string;
    source?: ReservationSource;
}

export interface AssignRoomPayload {
    roomId: string;
}

export interface CheckInPayload {
    roomId?: string;
    idType?: string;
    idNumber?: string;
    internalNotes?: string;
}

export interface CheckOutPayload {
    internalNotes?: string;
}

export interface CancelPayload {
    reason: string;
    waiveCancellationCharge?: boolean;
}

export interface NoShowPayload {
    notes?: string;
    waiveCharge?: boolean;
}

export interface ReservationListParams {
    status?: ReservationStatus;
    checkInDate?: string;
    checkOutDate?: string;
    guestId?: string;
    roomId?: string;
    roomTypeId?: string;
    source?: ReservationSource;
    search?: string;
    page?: number;
    limit?: number;
}

export interface ArrivalDepartureParams {
    date?: string;       // ISO date — defaults to today
}

// ─── Status history ───────────────────────────────────────────────────────────

export interface StatusHistoryEntry {
    _id: string;
    fromStatus?: ReservationStatus;
    toStatus: ReservationStatus;
    reason?: string;
    changedBy: { _id: string; name: string; email: string };
    createdAt: string;
}

// ─── Arrivals / departures / in-house shapes ──────────────────────────────────

export interface ArrivalsData {
    date: string;
    count: number;
    arrivals: Reservation[];
}

export interface DeparturesData {
    date: string;
    count: number;
    departures: Reservation[];
}

export interface InHouseData {
    count: number;
    guests: Reservation[];
}

// ─── API calls ────────────────────────────────────────────────────────────────

/** GET /api/reservations */
export const getReservations = async (params?: ReservationListParams) => {
    const res = await client.get<ApiResponse<ReservationListData>>(
        "/reservations",
        { params }
    );
    return res.data;
};

/** GET /api/reservations/arrivals */
export const getArrivals = async (params?: ArrivalDepartureParams) => {
    const res = await client.get<ApiResponse<ArrivalsData>>(
        "/reservations/arrivals",
        { params }
    );
    return res.data;
};

/** GET /api/reservations/departures */
export const getDepartures = async (params?: ArrivalDepartureParams) => {
    const res = await client.get<ApiResponse<DeparturesData>>(
        "/reservations/departures",
        { params }
    );
    return res.data;
};

/** GET /api/reservations/in-house */
export const getInHouseGuests = async () => {
    const res = await client.get<ApiResponse<InHouseData>>("/reservations/in-house");
    return res.data;
};

/** GET /api/reservations/:id */
export const getReservationById = async (id: string) => {
    const res = await client.get<ApiResponse<{
        reservation: Reservation;
        statusHistory: StatusHistoryEntry[];
    }>>(`/reservations/${id}`);
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
export const updateReservation = async (id: string, payload: UpdateReservationPayload) => {
    const res = await client.patch<ApiResponse<{ reservation: Reservation }>>(
        `/reservations/${id}`,
        payload
    );
    return res.data;
};

/** PATCH /api/reservations/:id/assign-room */
export const assignRoom = async (id: string, payload: AssignRoomPayload) => {
    const res = await client.patch<ApiResponse<{ reservation: Reservation }>>(
        `/reservations/${id}/assign-room`,
        payload
    );
    return res.data;
};

/** PATCH /api/reservations/:id/check-in */
export const checkIn = async (id: string, payload: CheckInPayload) => {
    const res = await client.patch<ApiResponse<{
        reservation: Reservation;
        room: { _id: string; roomNumber: string };
    }>>(`/reservations/${id}/check-in`, payload);
    return res.data;
};

/** PATCH /api/reservations/:id/check-out */
export const checkOut = async (id: string, payload?: CheckOutPayload) => {
    const res = await client.patch<ApiResponse<{ reservation: Reservation }>>(
        `/reservations/${id}/check-out`,
        payload ?? {}
    );
    return res.data;
};

/** PATCH /api/reservations/:id/cancel */
export const cancelReservation = async (id: string, payload: CancelPayload) => {
    const res = await client.patch<ApiResponse<{
        reservation: Reservation;
        cancellationCharge: number;
    }>>(`/reservations/${id}/cancel`, payload);
    return res.data;
};

/** PATCH /api/reservations/:id/no-show */
export const markNoShow = async (id: string, payload?: NoShowPayload) => {
    const res = await client.patch<ApiResponse<{
        reservation: Reservation;
        noShowCharge: number;
    }>>(`/reservations/${id}/no-show`, payload ?? {});
    return res.data;
};

/** GET /api/reservations/:id/status-history */
export const getStatusHistory = async (id: string) => {
    const res = await client.get<ApiResponse<{
        reservation: { confirmationNumber: string; status: ReservationStatus };
        history: StatusHistoryEntry[];
    }>>(`/reservations/${id}/status-history`);
    return res.data;
};