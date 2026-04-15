"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import * as roomService from "@/services/room.service";
import type {
    AvailabilityParams,
    CreateFloorPayload,
    CreatePropertyPayload,
    CreateRatePlanPayload,
    CreateRoomBlockPayload,
    CreateRoomPayload,
    CreateRoomTypePayload,
    RatePlanListParams,
    ResolveRoomBlockPayload,
    RoomBlockListParams,
    RoomListParams,
    UpdateFloorPayload,
    UpdatePropertyPayload,
    UpdateRatePlanPayload,
    UpdateRoomPayload,
    UpdateRoomStatusPayload,
    UpdateRoomTypePayload,
} from "@/types";

// ─── Query keys ───────────────────────────────────────────────────────────────
export const roomKeys = {
    all: ["rooms"] as const,
    property: ["property"] as const,
    list: (params?: RoomListParams) => ["rooms", "list", params] as const,
    detail: (id: string) => ["rooms", "detail", id] as const,
    availability: (params: AvailabilityParams) => ["rooms", "availability", params] as const,
    types: ["room-types"] as const,
    typeDetail: (id: string) => ["room-types", "detail", id] as const,
    floors: ["floors"] as const,
    ratePlans: (params?: RatePlanListParams) => ["rate-plans", params] as const,
    ratePlanDetail: (id: string) => ["rate-plans", "detail", id] as const,
    ratePlanPreview: (id: string) => ["rate-plans", "preview", id] as const,
    roomBlocks: (params?: RoomBlockListParams) => ["room-blocks", params] as const,
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

export function useRoomTypes() {
    return useQuery({
        queryKey: roomKeys.types,
        queryFn: () => roomService.getRoomTypes(),
        select: (res) => res.data.roomTypes,
        staleTime: Infinity,
    });
}

export function useFloors() {
    return useQuery({
        queryKey: roomKeys.floors,
        queryFn: () => roomService.getFloors(),
        select: (res) => res.data.floors,
        staleTime: Infinity,
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

        // Optimistic update — change the status in cache immediately
        // so the grid tile recolours before the server responds.
        onMutate: async ({ id, payload }) => {
            await qc.cancelQueries({ queryKey: roomKeys.all });

            // Snapshot all room list queries for rollback
            const previousLists = qc.getQueriesData({ queryKey: roomKeys.all });

            qc.setQueriesData(
                { queryKey: roomKeys.all },
                (old: any) => {
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
                }
            );

            return { previousLists };
        },

        onError: (_err, _vars, context) => {
            // Roll back on failure
            context?.previousLists.forEach(([queryKey, data]) => {
                qc.setQueryData(queryKey, data);
            });
            toast.error("Failed to update room status.");
        },

        onSuccess: (res) => {
            const room = res.data.room;
            toast.success(`Room ${room.roomNumber} marked as ${room.status.replace(/_/g, " ")}.`);
        },

        onSettled: () => {
            qc.invalidateQueries({ queryKey: roomKeys.all });
        },
    });
}

export function useUpdateRoom(id: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateRoomPayload) => roomService.updateRoom(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: roomKeys.all });
            qc.invalidateQueries({ queryKey: roomKeys.detail(id) });
            toast.success("Room updated.");
        },
        onError: (err: Error) => {
            toast.error(err.message ?? "Failed to update room.");
        },
    });
}

export function useProperty() {
    return useQuery({
        queryKey: roomKeys.property,
        queryFn: () => roomService.getProperty(),
        select: (res) => res.data.property,
        retry: false,
    });
}

export function useRoomType(id: string) {
    return useQuery({
        queryKey: roomKeys.typeDetail(id),
        queryFn: () => roomService.getRoomTypeById(id),
        select: (res) => res.data.roomType,
        enabled: !!id,
    });
}

export function useAvailability(params: AvailabilityParams, enabled = true) {
    return useQuery({
        queryKey: roomKeys.availability(params),
        queryFn: () => roomService.getAvailability(params),
        select: (res) => res.data,
        enabled,
    });
}

export function useRatePlans(params?: RatePlanListParams) {
    return useQuery({
        queryKey: roomKeys.ratePlans(params),
        queryFn: () => roomService.getRatePlans(params),
        select: (res) => res.data.ratePlans,
    });
}

export function useRatePlan(id: string) {
    return useQuery({
        queryKey: roomKeys.ratePlanDetail(id),
        queryFn: () => roomService.getRatePlanById(id),
        select: (res) => res.data.ratePlan,
        enabled: !!id,
    });
}

export function useRatePlanPreview(id: string) {
    return useQuery({
        queryKey: roomKeys.ratePlanPreview(id),
        queryFn: () => roomService.previewRatePlan(id),
        select: (res) => res.data,
        enabled: !!id,
    });
}

export function useRoomBlocks(params?: RoomBlockListParams) {
    return useQuery({
        queryKey: roomKeys.roomBlocks(params),
        queryFn: () => roomService.getRoomBlocks(params),
        select: (res) => res.data.blocks,
    });
}

export function useCreateProperty() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreatePropertyPayload) => roomService.createProperty(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: roomKeys.property });
            toast.success("Property created.");
        },
        onError: (err: Error) => {
            toast.error(err.message ?? "Failed to create property.");
        },
    });
}

export function useUpdateProperty() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdatePropertyPayload) => roomService.updateProperty(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: roomKeys.property });
            toast.success("Property updated.");
        },
        onError: (err: Error) => {
            toast.error(err.message ?? "Failed to update property.");
        },
    });
}

export function useCreateFloor() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateFloorPayload) => roomService.createFloor(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: roomKeys.floors });
            toast.success("Floor created.");
        },
        onError: (err: Error) => {
            toast.error(err.message ?? "Failed to create floor.");
        },
    });
}

export function useUpdateFloor() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateFloorPayload }) =>
            roomService.updateFloor(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: roomKeys.floors });
            toast.success("Floor updated.");
        },
        onError: (err: Error) => {
            toast.error(err.message ?? "Failed to update floor.");
        },
    });
}

export function useCreateRoomType() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateRoomTypePayload) => roomService.createRoomType(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: roomKeys.types });
            toast.success("Room type created.");
        },
        onError: (err: Error) => {
            toast.error(err.message ?? "Failed to create room type.");
        },
    });
}

export function useUpdateRoomType() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateRoomTypePayload }) =>
            roomService.updateRoomType(id, payload),
        onSuccess: (_res, vars) => {
            qc.invalidateQueries({ queryKey: roomKeys.types });
            qc.invalidateQueries({ queryKey: roomKeys.typeDetail(vars.id) });
            toast.success("Room type updated.");
        },
        onError: (err: Error) => {
            toast.error(err.message ?? "Failed to update room type.");
        },
    });
}

export function useCreateRoom() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateRoomPayload) => roomService.createRoom(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: roomKeys.all });
            toast.success("Room created.");
        },
        onError: (err: Error) => {
            toast.error(err.message ?? "Failed to create room.");
        },
    });
}

export function useCreateRatePlan() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateRatePlanPayload) => roomService.createRatePlan(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["rate-plans"] });
            toast.success("Rate plan created.");
        },
        onError: (err: Error) => {
            toast.error(err.message ?? "Failed to create rate plan.");
        },
    });
}

export function useUpdateRatePlan() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateRatePlanPayload }) =>
            roomService.updateRatePlan(id, payload),
        onSuccess: (_res, vars) => {
            qc.invalidateQueries({ queryKey: ["rate-plans"] });
            qc.invalidateQueries({ queryKey: roomKeys.ratePlanDetail(vars.id) });
            qc.invalidateQueries({ queryKey: roomKeys.ratePlanPreview(vars.id) });
            toast.success("Rate plan updated.");
        },
        onError: (err: Error) => {
            toast.error(err.message ?? "Failed to update rate plan.");
        },
    });
}

export function useDeactivateRatePlan() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => roomService.deactivateRatePlan(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["rate-plans"] });
            toast.success("Rate plan deactivated.");
        },
        onError: (err: Error) => {
            toast.error(err.message ?? "Failed to deactivate rate plan.");
        },
    });
}

export function useCreateRoomBlock() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateRoomBlockPayload) => roomService.createRoomBlock(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["room-blocks"] });
            qc.invalidateQueries({ queryKey: roomKeys.all });
            toast.success("Room block created.");
        },
        onError: (err: Error) => {
            toast.error(err.message ?? "Failed to create room block.");
        },
    });
}

export function useResolveRoomBlock() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: ResolveRoomBlockPayload }) =>
            roomService.resolveRoomBlock(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["room-blocks"] });
            qc.invalidateQueries({ queryKey: roomKeys.all });
            toast.success("Room block resolved.");
        },
        onError: (err: Error) => {
            toast.error(err.message ?? "Failed to resolve room block.");
        },
    });
}

export function useUpdateAnyRoom() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateRoomPayload }) =>
            roomService.updateRoom(id, payload),
        onSuccess: (_res, vars) => {
            qc.invalidateQueries({ queryKey: roomKeys.all });
            qc.invalidateQueries({ queryKey: roomKeys.detail(vars.id) });
            toast.success("Room updated.");
        },
        onError: (err: Error) => {
            toast.error(err.message ?? "Failed to update room.");
        },
    });
}