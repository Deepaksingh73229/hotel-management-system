/**
 * room.service.ts
 *
 * OPERATIONAL room calls — used by front desk and housekeeping daily.
 * Imported by: hooks/rooms/useRooms.ts
 *
 * What lives here:
 *   - Room list + detail (for the grid / housekeeping view)
 *   - Room status update (mark clean, dirty, OOO, etc.)
 *   - Room availability check (used when creating a reservation)
 *
 * What does NOT live here:
 *   - Creating / updating rooms            → settings.service.ts
 *   - Floors, room types, rate plans       → settings.service.ts
 *   - Property config                      → settings.service.ts
 *   - Room blocks (create / resolve)       → settings.service.ts
 */

import client from "./api/client";
import type {
    ApiResponse,
    RoomListData,
    RoomListParams,
    RoomData,
    UpdateRoomStatusPayload,
    AvailabilityParams,
    RoomAvailabilityData,
} from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

const buildParams = (params?: RoomListParams) => {
    if (!params) return { page: 1, limit: DEFAULT_LIMIT };

    const { roomTypeId, floorId, page, limit, ...rest } = params;

    return {
        ...rest,
        roomType: roomTypeId,
        floor: floorId,
        page: page ?? 1,
        limit: Math.min(limit ?? DEFAULT_LIMIT, MAX_LIMIT),
    };
};

// ─── Room list ────────────────────────────────────────────────────────────────

/** GET /api/rooms — paginated, filterable */
export const getAllRooms = async (params?: RoomListParams) => {
    const res = await client.get<ApiResponse<RoomListData>>("/rooms", {
        params: buildParams(params),
    });
    return res.data;
};

/** GET /api/rooms/:id */
export const getRoomById = async (id: string) => {
    const res = await client.get<ApiResponse<RoomData>>(`/rooms/${id}`);
    return res.data;
};

// ─── Housekeeping ─────────────────────────────────────────────────────────────

/**
 * PATCH /api/rooms/:id/status
 *
 * Scoped to its own endpoint so housekeeping permissions can be
 * separated from admin room-editing permissions later.
 */
export const updateRoomStatus = async (id: string, payload: UpdateRoomStatusPayload) => {
    const res = await client.patch<ApiResponse<RoomData>>(
        `/rooms/${id}/status`,
        payload
    );
    return res.data;
};

// ─── Availability ─────────────────────────────────────────────────────────────

/**
 * GET /api/rooms/availability
 *
 * Used by the NewReservationDrawer to show available rooms
 * for a given date range and occupancy requirement.
 */
export const getAvailability = async (params: AvailabilityParams) => {
    const res = await client.get<ApiResponse<RoomAvailabilityData>>(
        "/rooms/availability",
        { params }
    );
    return res.data;
};