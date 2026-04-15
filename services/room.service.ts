import client from "./api/client";
import type {
    ApiResponse,
    PropertyData,
    RoomListData,
    RoomListParams,
    RoomTypeListData,
    RoomTypeData,
    FloorListData,
    RoomData,
    Room,
    Property,
    Floor,
    RoomType,
    CreatePropertyPayload,
    UpdatePropertyPayload,
    CreateFloorPayload,
    UpdateFloorPayload,
    CreateRoomTypePayload,
    UpdateRoomTypePayload,
    CreateRoomPayload,
    UpdateRoomPayload,
    UpdateRoomStatusPayload,
    AvailabilityParams,
    RoomAvailabilityData,
    RatePlanListParams,
    RatePlanListData,
    RatePlanData,
    CreateRatePlanPayload,
    UpdateRatePlanPayload,
    RatePlanPreviewData,
    RoomBlockListParams,
    RoomBlockListData,
    RoomBlockData,
    CreateRoomBlockPayload,
    ResolveRoomBlockPayload,
} from "@/types";

const DEFAULT_ROOM_LIST_LIMIT = 50;
const MAX_ROOM_LIST_LIMIT = 100;

const buildRoomListQueryParams = (params?: RoomListParams) => {
    if (!params) {
        return { page: 1, limit: DEFAULT_ROOM_LIST_LIMIT };
    }

    const {
        roomTypeId,
        floorId,
        page,
        limit,
        ...rest
    } = params;

    return {
        ...rest,
        roomType: roomTypeId,
        floor: floorId,
        page: page ?? 1,
        limit: Math.min(limit ?? DEFAULT_ROOM_LIST_LIMIT, MAX_ROOM_LIST_LIMIT),
    };
};

/**
 * GET /api/rooms
 * Paginated list — supports status, roomType, floor filters.
 */
export const getAllRooms = async (params?: RoomListParams) => {
    const res = await client.get<ApiResponse<RoomListData>>("/rooms", {
        params: buildRoomListQueryParams(params),
    });
    return res.data;
};

/**
 * GET /api/rooms/:id
 */
export const getRoomById = async (id: string) => {
    const res = await client.get<ApiResponse<RoomData>>(`/rooms/${id}`);
    return res.data;
};

/**
 * POST /api/rooms
 */
export const createRoom = async (payload: CreateRoomPayload) => {
    const res = await client.post<ApiResponse<RoomData>>("/rooms", payload);
    return res.data;
};

/**
 * PATCH /api/rooms/:id
 * Update notes, features, or isActive.
 */
export const updateRoom = async (id: string, payload: UpdateRoomPayload) => {
    const res = await client.patch<ApiResponse<RoomData>>(`/rooms/${id}`, payload);
    return res.data;
};

/**
 * PATCH /api/rooms/:id/status
 * Housekeeping status change — its own endpoint so permissions
 * can be scoped to housekeeping staff later.
 */
export const updateRoomStatus = async (id: string, payload: UpdateRoomStatusPayload) => {
    const res = await client.patch<ApiResponse<RoomData>>(
        `/rooms/${id}/status`,
        payload
    );
    return res.data;
};

/**
 * GET /api/property
 */
export const getProperty = async () => {
    const res = await client.get<ApiResponse<PropertyData>>("/property");
    return res.data;
};

/**
 * POST /api/property
 */
export const createProperty = async (payload: CreatePropertyPayload) => {
    const res = await client.post<ApiResponse<PropertyData>>("/property", payload);
    return res.data;
};

/**
 * PATCH /api/property
 */
export const updateProperty = async (payload: UpdatePropertyPayload) => {
    const res = await client.patch<ApiResponse<PropertyData>>("/property", payload);
    return res.data;
};

/**
 * GET /api/room-types
 */
export const getRoomTypes = async () => {
    const res = await client.get<ApiResponse<RoomTypeListData>>("/room-types");
    return res.data;
};

/**
 * GET /api/room-types/:id
 */
export const getRoomTypeById = async (id: string) => {
    const res = await client.get<ApiResponse<RoomTypeData>>(`/room-types/${id}`);
    return res.data;
};

/**
 * POST /api/room-types
 */
export const createRoomType = async (payload: CreateRoomTypePayload) => {
    const res = await client.post<ApiResponse<RoomTypeData>>("/room-types", payload);
    return res.data;
};

/**
 * PATCH /api/room-types/:id
 */
export const updateRoomType = async (id: string, payload: UpdateRoomTypePayload) => {
    const res = await client.patch<ApiResponse<RoomTypeData>>(`/room-types/${id}`, payload);
    return res.data;
};

/**
 * GET /api/floors
 */
export const getFloors = async () => {
    const res = await client.get<ApiResponse<FloorListData>>("/floors");
    return res.data;
};

/**
 * POST /api/floors
 */
export const createFloor = async (payload: CreateFloorPayload) => {
    const res = await client.post<ApiResponse<{ floor: Floor }>>("/floors", payload);
    return res.data;
};

/**
 * PATCH /api/floors/:id
 */
export const updateFloor = async (id: string, payload: UpdateFloorPayload) => {
    const res = await client.patch<ApiResponse<{ floor: Floor }>>(`/floors/${id}`, payload);
    return res.data;
};

/**
 * GET /api/rooms/availability
 */
export const getAvailability = async (params: AvailabilityParams) => {
    const res = await client.get<ApiResponse<RoomAvailabilityData>>("/rooms/availability", {
        params,
    });
    return res.data;
};

/**
 * GET /api/rate-plans
 */
export const getRatePlans = async (params?: RatePlanListParams) => {
    const res = await client.get<ApiResponse<RatePlanListData>>("/rate-plans", { params });
    return res.data;
};

/**
 * GET /api/rate-plans/:id
 */
export const getRatePlanById = async (id: string) => {
    const res = await client.get<ApiResponse<RatePlanData>>(`/rate-plans/${id}`);
    return res.data;
};

/**
 * POST /api/rate-plans
 */
export const createRatePlan = async (payload: CreateRatePlanPayload) => {
    const res = await client.post<ApiResponse<RatePlanData>>("/rate-plans", payload);
    return res.data;
};

/**
 * PATCH /api/rate-plans/:id
 */
export const updateRatePlan = async (id: string, payload: UpdateRatePlanPayload) => {
    const res = await client.patch<ApiResponse<RatePlanData>>(`/rate-plans/${id}`, payload);
    return res.data;
};

/**
 * DELETE /api/rate-plans/:id
 */
export const deactivateRatePlan = async (id: string) => {
    const res = await client.delete<ApiResponse<null>>(`/rate-plans/${id}`);
    return res.data;
};

/**
 * GET /api/rate-plans/:id/preview
 */
export const previewRatePlan = async (id: string) => {
    const res = await client.get<ApiResponse<RatePlanPreviewData>>(`/rate-plans/${id}/preview`);
    return res.data;
};

/**
 * GET /api/room-blocks
 */
export const getRoomBlocks = async (params?: RoomBlockListParams) => {
    const res = await client.get<ApiResponse<RoomBlockListData>>("/room-blocks", { params });
    return res.data;
};

/**
 * POST /api/room-blocks
 */
export const createRoomBlock = async (payload: CreateRoomBlockPayload) => {
    const res = await client.post<ApiResponse<RoomBlockData>>("/room-blocks", payload);
    return res.data;
};

/**
 * PATCH /api/room-blocks/:id/resolve
 */
export const resolveRoomBlock = async (id: string, payload: ResolveRoomBlockPayload) => {
    const res = await client.patch<ApiResponse<RoomBlockData>>(`/room-blocks/${id}/resolve`, payload);
    return res.data;
};