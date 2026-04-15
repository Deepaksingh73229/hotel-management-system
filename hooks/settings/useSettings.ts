"use client";

/**
 * hooks/settings/useSettings.ts
 *
 * ADMIN CONFIG hooks — used exclusively by the Settings page.
 * All hooks here call settings.service.ts only.
 *
 * Operational room hooks live in hooks/rooms/useRooms.ts.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import * as settingsService from "@/services/settings.service";
import type {
    CreatePropertyPayload,
    UpdatePropertyPayload,
    CreateFloorPayload,
    UpdateFloorPayload,
    CreateRoomTypePayload,
    UpdateRoomTypePayload,
    CreateRoomPayload,
    UpdateRoomPayload,
    RatePlanListParams,
    CreateRatePlanPayload,
    UpdateRatePlanPayload,
    RoomBlockListParams,
    CreateRoomBlockPayload,
    ResolveRoomBlockPayload,
} from "@/types";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const settingsKeys = {
    property: ["settings", "property"] as const,
    floors: ["settings", "floors"] as const,
    roomTypes: ["settings", "roomTypes"] as const,
    roomType: (id: string) => ["settings", "roomTypes", id] as const,
    ratePlans: (p?: RatePlanListParams) => ["settings", "ratePlans", p] as const,
    ratePlan: (id: string) => ["settings", "ratePlans", id] as const,
    ratePlanPreview: (id: string) => ["settings", "ratePlans", id, "preview"] as const,
    roomBlocks: (p?: RoomBlockListParams) => ["settings", "roomBlocks", p] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// PROPERTY
// ─────────────────────────────────────────────────────────────────────────────

export function useProperty() {
    return useQuery({
        queryKey: settingsKeys.property,
        queryFn: () => settingsService.getProperty(),
        select: (res) => res.data.property,
        staleTime: Infinity,   // property config never changes at runtime
    });
}

export function useCreateProperty() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreatePropertyPayload) =>
            settingsService.createProperty(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.property });
            toast.success("Property created.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to create property."),
    });
}

export function useUpdateProperty() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: UpdatePropertyPayload) =>
            settingsService.updateProperty(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.property });
            toast.success("Property updated.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to update property."),
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOORS
// ─────────────────────────────────────────────────────────────────────────────

export function useFloors() {
    return useQuery({
        queryKey: settingsKeys.floors,
        queryFn: () => settingsService.getFloors(),
        select: (res) => res.data.floors,
        staleTime: Infinity,
    });
}

export function useCreateFloor() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateFloorPayload) =>
            settingsService.createFloor(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.floors });
            // Rooms grid also groups by floor — refresh it too
            qc.invalidateQueries({ queryKey: ["rooms"] });
            toast.success("Floor created.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to create floor."),
    });
}

export function useUpdateFloor() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateFloorPayload }) =>
            settingsService.updateFloor(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.floors });
            qc.invalidateQueries({ queryKey: ["rooms"] });
            toast.success("Floor updated.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to update floor."),
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOM TYPES
// ─────────────────────────────────────────────────────────────────────────────

export function useRoomTypes() {
    return useQuery({
        queryKey: settingsKeys.roomTypes,
        queryFn: () => settingsService.getRoomTypes(),
        select: (res) => res.data.roomTypes,
        staleTime: Infinity,
    });
}

export function useRoomType(id: string) {
    return useQuery({
        queryKey: settingsKeys.roomType(id),
        queryFn: () => settingsService.getRoomTypeById(id),
        select: (res) => res.data.roomType,
        enabled: !!id,
        staleTime: Infinity,
    });
}

export function useCreateRoomType() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateRoomTypePayload) =>
            settingsService.createRoomType(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.roomTypes });
            toast.success("Room type created.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to create room type."),
    });
}

export function useUpdateRoomType() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateRoomTypePayload }) =>
            settingsService.updateRoomType(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.roomTypes });
            qc.invalidateQueries({ queryKey: ["rooms"] });
            toast.success("Room type updated.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to update room type."),
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOMS (admin — create + metadata only)
// ─────────────────────────────────────────────────────────────────────────────

export function useCreateRoom() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateRoomPayload) =>
            settingsService.createRoom(payload),
        onSuccess: (res) => {
            qc.invalidateQueries({ queryKey: ["rooms"] });
            toast.success(`Room ${res.data.room.roomNumber} created.`);
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to create room."),
    });
}

export function useUpdateAnyRoom() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateRoomPayload }) =>
            settingsService.updateRoomMetadata(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["rooms"] });
            toast.success("Room updated.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to update room."),
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// RATE PLANS
// ─────────────────────────────────────────────────────────────────────────────

export function useRatePlans(params?: RatePlanListParams) {
    return useQuery({
        queryKey: settingsKeys.ratePlans(params),
        queryFn: () => settingsService.getRatePlans(params),
        select: (res) => res.data.ratePlans,
        staleTime: Infinity,
    });
}

export function useRatePlan(id: string) {
    return useQuery({
        queryKey: settingsKeys.ratePlan(id),
        queryFn: () => settingsService.getRatePlanById(id),
        select: (res) => res.data.ratePlan,
        enabled: !!id,
        staleTime: Infinity,
    });
}

export function useRatePlanPreview(id: string) {
    return useQuery({
        queryKey: settingsKeys.ratePlanPreview(id),
        queryFn: () => settingsService.previewRatePlan(id),
        select: (res) => res.data,
        enabled: !!id,
        staleTime: 1000 * 30,   // preview stale after 30s — rates can change
    });
}

export function useCreateRatePlan() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateRatePlanPayload) =>
            settingsService.createRatePlan(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.ratePlans() });
            toast.success("Rate plan created.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to create rate plan."),
    });
}

export function useUpdateRatePlan() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateRatePlanPayload }) =>
            settingsService.updateRatePlan(id, payload),
        onSuccess: (_res, { id }) => {
            qc.invalidateQueries({ queryKey: settingsKeys.ratePlans() });
            qc.invalidateQueries({ queryKey: settingsKeys.ratePlan(id) });
            qc.invalidateQueries({ queryKey: settingsKeys.ratePlanPreview(id) });
            toast.success("Rate plan updated.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to update rate plan."),
    });
}

export function useDeactivateRatePlan() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => settingsService.deactivateRatePlan(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.ratePlans() });
            toast.success("Rate plan deactivated.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to deactivate rate plan."),
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOM BLOCKS
// ─────────────────────────────────────────────────────────────────────────────

export function useRoomBlocks(params?: RoomBlockListParams) {
    return useQuery({
        queryKey: settingsKeys.roomBlocks(params),
        queryFn: () => settingsService.getRoomBlocks(params),
        select: (res) => res.data.blocks,
        staleTime: 1000 * 60 * 5,
    });
}

export function useCreateRoomBlock() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateRoomBlockPayload) =>
            settingsService.createRoomBlock(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.roomBlocks() });
            // Room grid should also reflect the block
            qc.invalidateQueries({ queryKey: ["rooms"] });
            toast.success("Room blocked.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to block room."),
    });
}

export function useResolveRoomBlock() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: ResolveRoomBlockPayload }) =>
            settingsService.resolveRoomBlock(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.roomBlocks() });
            qc.invalidateQueries({ queryKey: ["rooms"] });
            toast.success("Block resolved.");
        },
        onError: (err: Error) => toast.error(err.message ?? "Failed to resolve block."),
    });
}