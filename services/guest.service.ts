import client from "./api/client";
import type {
    ApiResponse,
    GuestListData,
    GuestListParams,
    Guest,
    CreateGuestPayload,
    UpdateGuestPayload,
} from "@/types";

/**
 * GET /api/guests
 * Paginated, searchable, tag-filterable list.
 */
export const getAllGuests = async (params?: GuestListParams) => {
    const res = await client.get<ApiResponse<GuestListData>>("/guests", { params });
    return res.data;
};

/**
 * GET /api/guests/:id
 */
export const getGuestById = async (id: string) => {
    const res = await client.get<ApiResponse<{ guest: Guest }>>(`/guests/${id}`);
    return res.data;
};

/**
 * POST /api/guests
 */
export const createGuest = async (payload: CreateGuestPayload) => {
    const res = await client.post<ApiResponse<{ guest: Guest }>>("/guests", payload);
    return res.data;
};

/**
 * PATCH /api/guests/:id
 */
export const updateGuest = async (id: string, payload: UpdateGuestPayload) => {
    const res = await client.patch<ApiResponse<{ guest: Guest }>>(`/guests/${id}`, payload);
    return res.data;
};

/**
 * DELETE /api/guests/:id  (soft delete — sets isActive: false)
 */
export const deactivateGuest = async (id: string) => {
    const res = await client.delete<ApiResponse<null>>(`/guests/${id}`);
    return res.data;
};