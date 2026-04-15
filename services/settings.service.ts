/**
 * settings.service.ts
 *
 * ADMIN CONFIGURATION calls — used by the Settings page only.
 * Imported by: hooks/settings/useSettings.ts
 *
 * What lives here:
 *   - Property (create / update)
 *   - Floors (create / update)
 *   - Room types (create / update)
 *   - Rooms (create / update metadata — NOT status, that's room.service.ts)
 *   - Rate plans (create / update / deactivate / preview)
 *   - Room blocks (create / resolve)
 *
 * Read-only lookups that are also needed outside Settings
 * (e.g. dropdowns in reservation forms) stay in room.service.ts
 * via getRoomTypes() and getFloors(). This file re-exports nothing —
 * consumers should import from whichever service owns the write path.
 */

import client from "./api/client";
import type {
    ApiResponse,
    PropertyData,
    Property,
    Floor,
    FloorListData,
    RoomType,
    RoomTypeListData,
    RoomTypeData,
    RoomData,
    RatePlanListData,
    RatePlanListParams,
    RatePlanData,
    RatePlanPreviewData,
    RoomBlockListData,
    RoomBlockListParams,
    RoomBlockData,
    CreatePropertyPayload,
    UpdatePropertyPayload,
    CreateFloorPayload,
    UpdateFloorPayload,
    CreateRoomTypePayload,
    UpdateRoomTypePayload,
    CreateRoomPayload,
    UpdateRoomPayload,
    CreateRatePlanPayload,
    UpdateRatePlanPayload,
    CreateRoomBlockPayload,
    ResolveRoomBlockPayload,
} from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// PROPERTY
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/property — single property document */
export const getProperty = async () => {
    const res = await client.get<ApiResponse<PropertyData>>("/property");
    return res.data;
};

/** POST /api/property */
export const createProperty = async (payload: CreatePropertyPayload) => {
    const res = await client.post<ApiResponse<PropertyData>>("/property", payload);
    return res.data;
};

/** PATCH /api/property */
export const updateProperty = async (payload: UpdatePropertyPayload) => {
    const res = await client.patch<ApiResponse<PropertyData>>("/property", payload);
    return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// FLOORS
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/floors */
export const getFloors = async () => {
    const res = await client.get<ApiResponse<FloorListData>>("/floors");
    return res.data;
};

/** POST /api/floors */
export const createFloor = async (payload: CreateFloorPayload) => {
    const res = await client.post<ApiResponse<{ floor: Floor }>>("/floors", payload);
    return res.data;
};

/** PATCH /api/floors/:id */
export const updateFloor = async (id: string, payload: UpdateFloorPayload) => {
    const res = await client.patch<ApiResponse<{ floor: Floor }>>(
        `/floors/${id}`,
        payload
    );
    return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// ROOM TYPES
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/room-types */
export const getRoomTypes = async () => {
    const res = await client.get<ApiResponse<RoomTypeListData>>("/room-types");
    return res.data;
};

/** GET /api/room-types/:id */
export const getRoomTypeById = async (id: string) => {
    const res = await client.get<ApiResponse<RoomTypeData>>(`/room-types/${id}`);
    return res.data;
};

/** POST /api/room-types */
export const createRoomType = async (payload: CreateRoomTypePayload) => {
    const res = await client.post<ApiResponse<RoomTypeData>>("/room-types", payload);
    return res.data;
};

/** PATCH /api/room-types/:id */
export const updateRoomType = async (id: string, payload: UpdateRoomTypePayload) => {
    const res = await client.patch<ApiResponse<RoomTypeData>>(
        `/room-types/${id}`,
        payload
    );
    return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// ROOMS (admin — create / update metadata only)
// Status changes go through room.service.ts → updateRoomStatus()
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/rooms */
export const createRoom = async (payload: CreateRoomPayload) => {
    const res = await client.post<ApiResponse<RoomData>>("/rooms", payload);
    return res.data;
};

/**
 * PATCH /api/rooms/:id
 * Only for admin metadata: notes, features, isActive.
 * NOT for status — use room.service.ts → updateRoomStatus() for that.
 */
export const updateRoomMetadata = async (id: string, payload: UpdateRoomPayload) => {
    const res = await client.patch<ApiResponse<RoomData>>(`/rooms/${id}`, payload);
    return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// RATE PLANS
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/rate-plans */
export const getRatePlans = async (params?: RatePlanListParams) => {
    const res = await client.get<ApiResponse<RatePlanListData>>(
        "/rate-plans",
        { params }
    );
    return res.data;
};

/** GET /api/rate-plans/:id */
export const getRatePlanById = async (id: string) => {
    const res = await client.get<ApiResponse<RatePlanData>>(`/rate-plans/${id}`);
    return res.data;
};

/** POST /api/rate-plans */
export const createRatePlan = async (payload: CreateRatePlanPayload) => {
    const res = await client.post<ApiResponse<RatePlanData>>("/rate-plans", payload);
    return res.data;
};

/** PATCH /api/rate-plans/:id */
export const updateRatePlan = async (id: string, payload: UpdateRatePlanPayload) => {
    const res = await client.patch<ApiResponse<RatePlanData>>(
        `/rate-plans/${id}`,
        payload
    );
    return res.data;
};

/** DELETE /api/rate-plans/:id — soft deactivation */
export const deactivateRatePlan = async (id: string) => {
    const res = await client.delete<ApiResponse<null>>(`/rate-plans/${id}`);
    return res.data;
};

/** GET /api/rate-plans/:id/preview */
export const previewRatePlan = async (id: string) => {
    const res = await client.get<ApiResponse<RatePlanPreviewData>>(
        `/rate-plans/${id}/preview`
    );
    return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// ROOM BLOCKS
// ─────────────────────────────────────────────────────────────────────────────

/** GET /api/room-blocks */
export const getRoomBlocks = async (params?: RoomBlockListParams) => {
    const res = await client.get<ApiResponse<RoomBlockListData>>(
        "/room-blocks",
        { params }
    );
    return res.data;
};

/** POST /api/room-blocks */
export const createRoomBlock = async (payload: CreateRoomBlockPayload) => {
    const res = await client.post<ApiResponse<RoomBlockData>>("/room-blocks", payload);
    return res.data;
};

/** PATCH /api/room-blocks/:id/resolve */
export const resolveRoomBlock = async (id: string, payload: ResolveRoomBlockPayload) => {
    const res = await client.patch<ApiResponse<RoomBlockData>>(
        `/room-blocks/${id}/resolve`,
        payload
    );
    return res.data;
};