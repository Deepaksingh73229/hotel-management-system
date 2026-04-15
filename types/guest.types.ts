import type { SearchParams, PaginationMeta } from "./api.types";

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export type GuestTitle  = "Mr" | "Mrs" | "Ms" | "Dr" | "Other";
export type GuestGender = "male" | "female" | "other" | "prefer_not_to_say";
export type GuestIdType = "aadhaar" | "passport" | "driving_license" | "voter_id" | "pan" | "other";
export type GuestTag    = "vip" | "blacklisted" | "corporate" | "repeat" | "loyalty";

// ─────────────────────────────────────────────────────────────────────────────
// GUEST
// ─────────────────────────────────────────────────────────────────────────────

export interface GuestAddress {
    line1?:   string;
    city?:    string;
    state?:   string;
    country?: string;
    pincode?: string;
}

export interface GuestPreferences {
    floorPreference?: string;
    bedPreference?:   string;
    pillow?:          string;
    dietary?:         string[];
    specialRequests?: string;
}

export interface Guest {
    _id:             string;
    title?:          GuestTitle;
    firstName:       string;
    lastName:        string;
    email?:          string;
    phone?:          string;
    alternatePhone?: string;
    nationality?:    string;
    dateOfBirth?:    string;
    gender?:         GuestGender;
    idType?:         GuestIdType;
    idNumber?:       string;
    idExpiryDate?:   string;
    idDocumentUrl?:  string;
    address?:        GuestAddress;
    tags?:           GuestTag[];
    preferences?:    GuestPreferences;
    loyaltyPoints:   number;
    totalStays:      number;
    totalSpend:      number;
    lastStayAt?:     string;
    notes?:          string;
    isActive:        boolean;
    createdAt:       string;
    updatedAt:       string;
}

// ─── Utility ─────────────────────────────────────────────────────────────────

export const guestFullName = (
    g: Pick<Guest, "title" | "firstName" | "lastName">
): string => [g.title, g.firstName, g.lastName].filter(Boolean).join(" ");

// ─────────────────────────────────────────────────────────────────────────────
// PAYLOADS
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateGuestPayload {
    title?:          GuestTitle;
    firstName:       string;
    lastName:        string;
    email?:          string;
    phone?:          string;
    alternatePhone?: string;
    nationality?:    string;
    dateOfBirth?:    string;
    gender?:         GuestGender;
    idType?:         GuestIdType;
    idNumber?:       string;
    address?:        GuestAddress;
    tags?:           GuestTag[];
    notes?:          string;
}

export type UpdateGuestPayload = Partial<CreateGuestPayload>;

// ─────────────────────────────────────────────────────────────────────────────
// QUERY PARAMS & RESPONSE SHAPES
// ─────────────────────────────────────────────────────────────────────────────

export interface GuestListParams extends SearchParams {
    tag?: GuestTag;
}

export interface GuestListData {
    guests:     Guest[];
    pagination: PaginationMeta;
}