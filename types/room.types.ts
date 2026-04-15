import type { PaginationMeta, SearchParams } from "./api.types";

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export type RoomStatus =
    | "vacant_clean"
    | "vacant_dirty"
    | "occupied"
    | "out_of_order"
    | "out_of_service"
    | "on_change";

export type BedType = "single" | "double" | "king" | "twin" | "queen" | "bunk";

export type RoomBlockReason = "maintenance" | "renovation" | "vip_hold" | "other";

export type RatePlanAdjustmentType = "flat" | "percent";

// ─────────────────────────────────────────────────────────────────────────────
// FLOOR
// ─────────────────────────────────────────────────────────────────────────────

export interface Floor {
    _id: string;
    property: string;
    floorNumber: number;
    label?: string;
    isActive: boolean;
}

export interface Property {
    _id: string;
    name: string;
    code?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    phone?: string;
    email?: string;
    website?: string;
    timezone?: string;
    currency?: string;
    totalRooms?: number;
    checkInTime?: string;
    checkOutTime?: string;
    createdAt?: string;
    updatedAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOM TYPE
// ─────────────────────────────────────────────────────────────────────────────

export interface RoomType {
    _id: string;
    property: string;
    name: string;
    code: string;
    description?: string;
    maxOccupancy: number;
    maxAdults: number;
    maxChildren: number;
    bedType?: BedType;
    baseRate: number;
    amenities?: string[];
    photos?: string[];
    isActive: boolean;
    sortOrder: number;
}

export interface RatePlan {
    _id: string;
    property: string;
    name: string;
    code: string;
    description?: string;
    isPublic?: boolean;
    isActive: boolean;
    applicableRoomTypes: RoomType[];
    adjustmentType?: RatePlanAdjustmentType;
    adjustmentValue?: number;
    validFrom?: string;
    validTo?: string;
    daysOfWeek?: number[];
    minimumNights?: number;
    maximumNights?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface RoomBlock {
    _id: string;
    room: Room;
    reason: RoomBlockReason | string;
    notes?: string;
    blockedFrom: string;
    blockedUntil: string;
    blockedBy?: {
        _id: string;
        name: string;
        email?: string;
    };
    isActive: boolean;
    resolvedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOM
// ─────────────────────────────────────────────────────────────────────────────

export interface Room {
    _id: string;
    property: string;
    roomNumber: string;
    floor: Floor;
    roomType: RoomType;
    status: RoomStatus;
    currentReservation?: string | null;
    features?: string[];
    notes?: string;
    isActive: boolean;
    lastCleanedAt?: string;
    lastInspectedAt?: string;
    createdAt: string;
    updatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS META — label + colour used across UI
// ─────────────────────────────────────────────────────────────────────────────

export interface RoomStatusMeta {
    label: string;
    shortLabel: string;
    color: string;         // tailwind bg class
    textColor: string;         // tailwind text class
    borderColor: string;        // tailwind border class
}

export const ROOM_STATUS_META: Record<RoomStatus, RoomStatusMeta> = {
    vacant_clean: {
        label: "Vacant clean",
        shortLabel: "VC",
        color: "bg-green-100  dark:bg-green-900/30",
        textColor: "text-green-700 dark:text-green-400",
        borderColor: "border-green-300 dark:border-green-700",
    },
    vacant_dirty: {
        label: "Vacant dirty",
        shortLabel: "VD",
        color: "bg-yellow-100  dark:bg-yellow-900/30",
        textColor: "text-yellow-700 dark:text-yellow-400",
        borderColor: "border-yellow-300 dark:border-yellow-700",
    },
    occupied: {
        label: "Occupied",
        shortLabel: "OC",
        color: "bg-blue-100  dark:bg-blue-900/30",
        textColor: "text-blue-700 dark:text-blue-400",
        borderColor: "border-blue-300 dark:border-blue-700",
    },
    on_change: {
        label: "On change",
        shortLabel: "CH",
        color: "bg-orange-100  dark:bg-orange-900/30",
        textColor: "text-orange-700 dark:text-orange-400",
        borderColor: "border-orange-300 dark:border-orange-700",
    },
    out_of_order: {
        label: "Out of order",
        shortLabel: "OO",
        color: "bg-red-100  dark:bg-red-900/30",
        textColor: "text-red-700 dark:text-red-400",
        borderColor: "border-red-300 dark:border-red-700",
    },
    out_of_service: {
        label: "Out of service",
        shortLabel: "OS",
        color: "bg-gray-100  dark:bg-gray-800",
        textColor: "text-gray-600 dark:text-gray-400",
        borderColor: "border-gray-300 dark:border-gray-600",
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// PAYLOADS
// ─────────────────────────────────────────────────────────────────────────────

export interface UpdateRoomStatusPayload {
    status: RoomStatus;
    notes?: string;
}

export interface UpdateRoomPayload {
    floor?: string;
    roomType?: string;
    status?: RoomStatus;
    notes?: string;
    features?: string[];
    isActive?: boolean;
}

export interface CreatePropertyPayload {
    name: string;
    code?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    phone?: string;
    email?: string;
    website?: string;
    timezone?: string;
    currency?: string;
    checkInTime?: string;
    checkOutTime?: string;
}

export interface UpdatePropertyPayload extends Partial<CreatePropertyPayload> {}

export interface CreateFloorPayload {
    floorNumber: number;
    label?: string;
}

export interface UpdateFloorPayload {
    label?: string;
    isActive?: boolean;
}

export interface CreateRoomTypePayload {
    name: string;
    code: string;
    description?: string;
    maxOccupancy: number;
    maxAdults: number;
    maxChildren?: number;
    bedType?: BedType;
    baseRate: number;
    amenities?: string[];
    photos?: string[];
    isActive?: boolean;
    sortOrder?: number;
}

export interface UpdateRoomTypePayload extends Partial<CreateRoomTypePayload> {}

export interface CreateRoomPayload {
    roomNumber: string;
    floor: string;
    roomType: string;
    features?: string[];
    notes?: string;
}

export interface RoomAvailabilityItem {
    roomType: RoomType;
    availableRooms: number;
    totalRooms: number;
}

export interface RoomAvailabilityData {
    checkIn: string;
    checkOut: string;
    nights: number;
    availability: RoomAvailabilityItem[];
}

export interface AvailabilityParams {
    checkIn: string;
    checkOut: string;
    adults?: number;
    children?: number;
}

export interface RatePlanListParams {
    isActive?: boolean;
    isPublic?: boolean;
    roomType?: string;
}

export interface CreateRatePlanPayload {
    name: string;
    code: string;
    description?: string;
    isPublic?: boolean;
    isActive?: boolean;
    applicableRoomTypes: string[];
    adjustmentType?: RatePlanAdjustmentType;
    adjustmentValue?: number;
    validFrom?: string;
    validTo?: string;
    daysOfWeek?: number[];
    minimumNights?: number;
    maximumNights?: number;
}

export interface UpdateRatePlanPayload extends Partial<CreateRatePlanPayload> {}

export interface RatePlanPreviewData {
    ratePlan: {
        _id: string;
        name: string;
        code: string;
    };
    currentlyValid: boolean;
    reason: string | null;
    preview: Array<{
        roomType: {
            _id: string;
            name: string;
            code: string;
        };
        baseRate: number;
        effectiveRate: number;
    }>;
}

export interface RoomBlockListParams {
    roomId?: string;
}

export interface CreateRoomBlockPayload {
    room: string;
    reason: RoomBlockReason | string;
    notes?: string;
    blockedFrom: string;
    blockedUntil: string;
}

export interface ResolveRoomBlockPayload {
    notes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUERY PARAMS & RESPONSE SHAPES
// ─────────────────────────────────────────────────────────────────────────────

export interface RoomListParams extends SearchParams {
    status?: RoomStatus;
    roomTypeId?: string;
    floorId?: string;
}

export interface RoomListData {
    rooms: Room[];
    pagination: PaginationMeta;
}

export interface RoomTypeListData {
    roomTypes: RoomType[];
}

export interface FloorListData {
    floors: Floor[];
}

export interface PropertyData {
    property: Property;
}

export interface RoomTypeData {
    roomType: RoomType;
}

export interface RoomData {
    room: Room;
}

export interface RatePlanListData {
    ratePlans: RatePlan[];
}

export interface RatePlanData {
    ratePlan: RatePlan;
}

export interface RoomBlockListData {
    blocks: RoomBlock[];
}

export interface RoomBlockData {
    block: RoomBlock;
}