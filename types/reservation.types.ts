import type { PaginationMeta, SearchParams } from "./api.types";
import type { Guest } from "./guest.types";
import type { Room, RoomType } from "./room.types";
import type { AuthUser } from "./auth.types";

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export type ReservationStatus =
    | "enquiry"
    | "confirmed"
    | "checked_in"
    | "checked_out"
    | "cancelled"
    | "no_show"
    | "waitlisted";

export type ReservationSource =
    | "direct"
    | "walk_in"
    | "phone"
    | "ota_booking"
    | "ota_expedia"
    | "ota_mmt"
    | "corporate"
    | "agent";

// ─────────────────────────────────────────────────────────────────────────────
// TAX LINE
// ─────────────────────────────────────────────────────────────────────────────

export interface TaxLine {
    taxName: string;
    rate: number;
    amount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// RESERVATION
// ─────────────────────────────────────────────────────────────────────────────

export interface Reservation {
    _id: string;
    property: string;
    confirmationNumber: string;

    primaryGuest: Guest;
    additionalGuests?: Guest[];

    roomType: RoomType;
    room?: Room | null;

    checkInDate: string;
    checkOutDate: string;
    nights: number;
    actualCheckInAt?: string;
    actualCheckOutAt?: string;

    adults: number;
    children: number;

    ratePlan?: string;
    ratePerNight: number;
    totalRoomCharge: number;
    totalAmount: number;
    discountAmount: number;
    discountReason?: string;
    taxes?: TaxLine[];

    status: ReservationStatus;
    source: ReservationSource;
    otaBookingId?: string;

    specialRequests?: string;
    internalNotes?: string;
    arrivalTime?: string;

    depositAmount: number;
    depositPaidAt?: string;
    depositPaymentMode?: string;

    cancellationReason?: string;
    cancelledAt?: string;
    cancelledBy?: AuthUser;
    cancellationCharge?: number;

    folio?: string;
    createdBy: AuthUser;
    checkedInBy?: AuthUser;
    checkedOutBy?: AuthUser;

    createdAt: string;
    updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS META
// ─────────────────────────────────────────────────────────────────────────────

export interface ReservationStatusMeta {
    label: string;
    variant: "blue" | "green" | "gray" | "red" | "orange" | "yellow" | "purple";
    dot?: boolean;
}

export const RESERVATION_STATUS_META: Record<ReservationStatus, ReservationStatusMeta> = {
    enquiry: { label: "Enquiry", variant: "yellow" },
    confirmed: { label: "Confirmed", variant: "blue" },
    checked_in: { label: "Checked in", variant: "green", dot: true },
    checked_out: { label: "Checked out", variant: "gray" },
    cancelled: { label: "Cancelled", variant: "red" },
    no_show: { label: "No show", variant: "orange" },
    waitlisted: { label: "Waitlisted", variant: "purple" },
};

// Status lifecycle order — used by the stepper
export const STATUS_LIFECYCLE: ReservationStatus[] = [
    "enquiry",
    "confirmed",
    "checked_in",
    "checked_out",
];

// ─────────────────────────────────────────────────────────────────────────────
// PAYLOADS
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateReservationPayload {
    primaryGuest: string;   // Guest ObjectId
    roomType: string;   // RoomType ObjectId
    checkInDate: string;   // ISO date string
    checkOutDate: string;
    adults: number;
    children?: number;
    ratePlan?: string;
    ratePerNight: number;
    source?: ReservationSource;
    specialRequests?: string;
    internalNotes?: string;
    arrivalTime?: string;
    depositAmount?: number;
}

export interface UpdateReservationPayload {
    specialRequests?: string;
    internalNotes?: string;
    arrivalTime?: string;
    room?: string;   // assign a specific room
    ratePlan?: string;
    ratePerNight?: number;
}

export interface CheckInPayload {
    roomId: string;            // required — must assign a room at check-in
}

export interface CancelReservationPayload {
    reason: string;
    cancellationCharge?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUERY PARAMS & RESPONSE SHAPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ReservationListParams extends SearchParams {
    status?: ReservationStatus;
    checkInDate?: string;
    checkOutDate?: string;
    roomTypeId?: string;
}

export interface ReservationListData {
    reservations: Reservation[];
    pagination: PaginationMeta;
}