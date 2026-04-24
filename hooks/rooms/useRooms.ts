"use client";

/**
 * hooks/rooms/useRooms.ts
 *
 * OPERATIONAL hooks — front desk and housekeeping.
 * All hooks here call room.service.ts only.
 *
 * Admin/config hooks (floors, room types, rate plans, etc.)
 * live in hooks/settings/useSettings.ts
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import * as roomService from "@/services/room.service";
import type { RoomListParams, UpdateRoomStatusPayload, AvailabilityParams } from "@/types";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const roomKeys = {
    all: ["rooms"] as const,
    list: (p?: RoomListParams) => ["rooms", "list", p] as const,
    detail: (id: string) => ["rooms", "detail", id] as const,
    availability: (p: AvailabilityParams) => ["rooms", "availability", p] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────────────────────────

export function useRooms(params?: RoomListParams) {
    return useQuery({
        queryKey: roomKeys.list(params),
        queryFn: () => roomService.getAllRooms(params),
        select: (res) => res.data,
    });
}

export function useRoom(id: string) {
    return useQuery({
        queryKey: roomKeys.detail(id),
        queryFn: () => roomService.getRoomById(id),
        select: (res) => res.data.room,
        enabled: !!id,
    });
}

export function useAvailability(params: AvailabilityParams, enabled = true) {
    return useQuery({
        queryKey: roomKeys.availability(params),
        queryFn: () => roomService.getAvailability(params),
        select: (res) => res.data,
        enabled: enabled && !!params.checkIn && !!params.checkOut,
        staleTime: 1000 * 60 * 2,   // availability data stale after 2 min
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

export function useUpdateRoomStatus() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateRoomStatusPayload }) =>
            roomService.updateRoomStatus(id, payload),

        // Optimistic update — tile recolours instantly before server responds
        onMutate: async ({ id, payload }) => {
            await qc.cancelQueries({ queryKey: roomKeys.all });

            const previousLists = qc.getQueriesData({ queryKey: roomKeys.all });

            qc.setQueriesData({ queryKey: roomKeys.all }, (old: any) => {
                if (!old?.data?.rooms) return old;
                return {
                    ...old,
                    data: {
                        ...old.data,
                        rooms: old.data.rooms.map((r: any) =>
                            r._id === id ? { ...r, status: payload.status } : r
                        ),
                    },
                };
            });

            return { previousLists };
        },

        onError: (_err, _vars, context) => {
            context?.previousLists.forEach(([queryKey, data]) => {
                qc.setQueryData(queryKey, data);
            });
            toast.error("Failed to update room status.");
        },

        onSuccess: (res) => {
            const room = res.data.room;
            toast.success(
                `Room ${room.roomNumber} → ${room.status.replace(/_/g, " ")}`
            );
        },

        onSettled: () => {
            qc.invalidateQueries({ queryKey: roomKeys.all });
        },
    });
}