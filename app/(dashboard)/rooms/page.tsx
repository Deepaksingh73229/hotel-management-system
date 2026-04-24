"use client";

import { useEffect, useMemo, useState } from "react";
import { BedDouble, Sparkles, Users, Wrench, RefreshCw } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { RoomGrid } from "@/components/rooms/RoomGrid";
import { RoomFilters } from "@/components/rooms/RoomFilters";
import { RoomDrawer } from "@/components/rooms/RoomDrawer";
import { useRooms } from "@/hooks/rooms/useRooms";
import { useFloors, useRoomTypes } from "@/hooks/settings/useSettings";
import type { Room, RoomStatus } from "@/types";

const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) return error.message;
    return "Unknown error";
};

const ROOM_FETCH_LIMIT = 100;

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }: {
    icon: React.ElementType;
    label: string;
    value: number;
    color: string;
}) => (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-4 h-4" />
        </div>
        
        <div>
            <p className="text-xl font-semibold text-foreground leading-tight">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────

export default function RoomsPage() {
    const showDebugPanel = process.env.NODE_ENV !== "production";
    const [statusFilter, setStatusFilter] = useState<RoomStatus | "all">("all");
    const [roomTypeFilter, setRoomTypeFilter] = useState<string>("all");
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    // Fetch all rooms without pagination for the grid view.
    const {
        data: roomData,
        isLoading: roomsLoading,
        isFetching: roomsFetching,
        isError: roomsHasError,
        error: roomsError,
        status: roomsStatus,
        refetch: refetchRooms,
    } = useRooms({
        limit: ROOM_FETCH_LIMIT,
        roomTypeId: roomTypeFilter === "all" ? undefined : roomTypeFilter,
    });

    const {
        data: floors = [],
        isLoading: floorsLoading,
        isFetching: floorsFetching,
        isError: floorsHasError,
        error: floorsError,
        status: floorsStatus,
        refetch: refetchFloors,
    } = useFloors();

    const {
        data: roomTypes = [],
        isLoading: roomTypesLoading,
        isFetching: roomTypesFetching,
        isError: roomTypesHasError,
        error: roomTypesError,
        status: roomTypesStatus,
        refetch: refetchRoomTypes,
    } = useRoomTypes();

    const rooms = roomData?.rooms ?? [];

    // ── Stats derived from the full unfiltered list ───────────────────────────
    const stats = useMemo(() => ({
        total: rooms.length,
        occupied: rooms.filter((r) => r.status === "occupied").length,
        vacantClean: rooms.filter((r) => r.status === "vacant_clean").length,
        vacantDirty: rooms.filter((r) => r.status === "vacant_dirty").length,
        onChange: rooms.filter((r) => r.status === "on_change").length,
        outOfOrder: rooms.filter((r) =>
            r.status === "out_of_order" || r.status === "out_of_service"
        ).length,
    }), [rooms]);

    const occupancyPct = stats.total > 0
        ? Math.round((stats.occupied / stats.total) * 100)
        : 0;

    useEffect(() => {
        if (!showDebugPanel) return;

        console.groupCollapsed("[RoomsPage] Query debug");
        console.log("queryParams", {
            limit: ROOM_FETCH_LIMIT,
            roomTypeId: roomTypeFilter === "all" ? undefined : roomTypeFilter,
        });
        console.log("rooms", {
            status: roomsStatus,
            isLoading: roomsLoading,
            isFetching: roomsFetching,
            count: rooms.length,
            pagination: roomData?.pagination,
            error: roomsHasError ? getErrorMessage(roomsError) : null,
        });
        console.log("floors", {
            status: floorsStatus,
            isLoading: floorsLoading,
            isFetching: floorsFetching,
            count: floors.length,
            error: floorsHasError ? getErrorMessage(floorsError) : null,
        });
        console.log("roomTypes", {
            status: roomTypesStatus,
            isLoading: roomTypesLoading,
            isFetching: roomTypesFetching,
            count: roomTypes.length,
            error: roomTypesHasError ? getErrorMessage(roomTypesError) : null,
        });
        console.groupEnd();
    }, [
        floors.length,
        floorsError,
        floorsFetching,
        floorsHasError,
        floorsLoading,
        floorsStatus,
        roomData?.pagination,
        roomTypeFilter,
        roomTypes.length,
        roomTypesError,
        roomTypesFetching,
        roomTypesHasError,
        roomTypesLoading,
        roomTypesStatus,
        rooms.length,
        roomsError,
        roomsFetching,
        roomsHasError,
        roomsLoading,
        roomsStatus,
        showDebugPanel,
    ]);

    const hasAnyQueryError = roomsHasError || floorsHasError || roomTypesHasError;
    const isAnyQueryFetching = roomsFetching || floorsFetching || roomTypesFetching;

    const refetchAll = async () => {
        await Promise.all([refetchRooms(), refetchFloors(), refetchRoomTypes()]);
    };

    return (
        <div className="p-6 space-y-6">

            <PageHeader
                title="Rooms"
                subtitle={`${occupancyPct}% occupancy · ${stats.total} rooms total`}
            />

            {showDebugPanel && (
                <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/70 dark:bg-amber-950/20 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                            Debug: Rooms backend fetch state
                        </p>
                        <button
                            type="button"
                            onClick={refetchAll}
                            disabled={isAnyQueryFetching}
                            className="px-3 py-1.5 rounded-md text-xs font-medium border border-amber-300 text-amber-900 hover:bg-amber-100 disabled:opacity-60 disabled:cursor-not-allowed dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/40"
                        >
                            {isAnyQueryFetching ? "Refreshing..." : "Refetch all"}
                        </button>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-2 text-xs">
                        <p className="text-amber-900/90 dark:text-amber-200/90">
                            Rooms: {roomsStatus} · {rooms.length} loaded
                        </p>
                        <p className="text-amber-900/90 dark:text-amber-200/90">
                            Floors: {floorsStatus} · {floors.length} loaded
                        </p>
                        <p className="text-amber-900/90 dark:text-amber-200/90">
                            Room types: {roomTypesStatus} · {roomTypes.length} loaded
                        </p>
                    </div>

                    {hasAnyQueryError && (
                        <div className="space-y-1 text-xs text-red-700 dark:text-red-300">
                            {roomsHasError && <p>Rooms error: {getErrorMessage(roomsError)}</p>}
                            {floorsHasError && <p>Floors error: {getErrorMessage(floorsError)}</p>}
                            {roomTypesHasError && <p>Room types error: {getErrorMessage(roomTypesError)}</p>}
                        </div>
                    )}
                </div>
            )}

            {/* ── Stats strip ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <StatCard
                    icon={Users}
                    label="Occupied"
                    value={stats.occupied}
                    color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                />
                <StatCard
                    icon={Sparkles}
                    label="Vacant clean"
                    value={stats.vacantClean}
                    color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                />
                <StatCard
                    icon={BedDouble}
                    label="Vacant dirty"
                    value={stats.vacantDirty}
                    color="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                />
                <StatCard
                    icon={RefreshCw}
                    label="On change"
                    value={stats.onChange}
                    color="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                />
                <StatCard
                    icon={Wrench}
                    label="Out of order"
                    value={stats.outOfOrder}
                    color="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                />
            </div>

            {/* ── Filters ─────────────────────────────────────────── */}
            <RoomFilters
                statusFilter={statusFilter}
                roomTypeFilter={roomTypeFilter}
                roomTypes={roomTypes}
                onStatusChange={setStatusFilter}
                onTypeChange={setRoomTypeFilter}
            />

            {/* ── Visual grid ─────────────────────────────────────── */}
            <RoomGrid
                rooms={rooms}
                floors={floors}
                isLoading={roomsLoading || floorsLoading}
                statusFilter={statusFilter}
                onRoomClick={setSelectedRoom}
            />

            {/* ── Room detail drawer ───────────────────────────────── */}
            <RoomDrawer
                room={selectedRoom}
                open={!!selectedRoom}
                onOpenChange={(open) => { if (!open) setSelectedRoom(null); }}
            />
        </div>
    );
}