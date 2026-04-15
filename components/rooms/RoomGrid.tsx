"use client";

import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RoomTile } from "./RoomTile";
import { EmptyState } from "@/components/common/EmptyState";
import { BedDouble } from "lucide-react";
import type { Room, RoomStatus, Floor } from "@/types";

// ─── Legend ───────────────────────────────────────────────────────────────────
const LEGEND = [
    { color: "bg-green-200  dark:bg-green-800", label: "Vacant clean" },
    { color: "bg-yellow-200 dark:bg-yellow-800", label: "Vacant dirty" },
    { color: "bg-blue-200   dark:bg-blue-800", label: "Occupied" },
    { color: "bg-orange-200 dark:bg-orange-800", label: "On change" },
    { color: "bg-red-200    dark:bg-red-800", label: "Out of order" },
    { color: "bg-gray-200   dark:bg-gray-700", label: "Out of service" },
];

interface RoomGridProps {
    rooms: Room[];
    floors: Floor[];
    isLoading: boolean;
    statusFilter: RoomStatus | "all";
    onRoomClick: (room: Room) => void;
}

export function RoomGrid({
    rooms,
    floors,
    isLoading,
    statusFilter,
    onRoomClick,
}: RoomGridProps) {

    // Group rooms by floor, sorted by floor number.
    const grouped = useMemo(() => {
        const filtered = statusFilter === "all"
            ? rooms
            : rooms.filter((r) => r.status === statusFilter);

        const byFloor = new Map<string, { floor: Floor; rooms: Room[] }>();

        // Initialise all active floors (so empty floors still show).
        floors
            .filter((f) => f.isActive)
            .sort((a, b) => a.floorNumber - b.floorNumber)
            .forEach((f) => byFloor.set(f._id, { floor: f, rooms: [] }));

        // Assign rooms to their floor.
        filtered.forEach((room) => {
            const floorId = room.floor._id;
            if (!byFloor.has(floorId)) {
                byFloor.set(floorId, { floor: room.floor, rooms: [] });
            }
            byFloor.get(floorId)!.rooms.push(room);
        });

        // Sort rooms within each floor by room number.
        byFloor.forEach((entry) => {
            entry.rooms.sort((a, b) =>
                a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })
            );
        });

        return [...byFloor.values()].filter((entry) => entry.rooms.length > 0);
    }, [rooms, floors, statusFilter]);

    // ── Loading skeleton ──────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="h-4 w-20 rounded" />
                        <div className="flex flex-wrap gap-3">
                            {Array.from({ length: 8 }).map((_, j) => (
                                <Skeleton key={j} className="w-[72px] h-[72px] rounded-xl" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // ── Empty ─────────────────────────────────────────────────────────────────
    if (grouped.length === 0) {
        return (
            <EmptyState
                icon={BedDouble}
                title="No rooms found"
                description={
                    statusFilter !== "all"
                        ? "No rooms match this status filter."
                        : "No rooms have been configured for this property yet."
                }
            />
        );
    }

    return (
        <div className="space-y-8">

            {/* ── Floor sections ───────────────────────────────────── */}
            {grouped.map(({ floor, rooms: floorRooms }) => (
                <section key={floor._id}>
                    {/* Floor header */}
                    <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-sm font-semibold text-foreground">
                            {floor.label ?? `Floor ${floor.floorNumber}`}
                        </h3>
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground">
                            {floorRooms.length} room{floorRooms.length !== 1 ? "s" : ""}
                        </span>
                    </div>

                    {/* Tiles */}
                    <div className="flex flex-wrap gap-3">
                        {floorRooms.map((room) => (
                            <RoomTile
                                key={room._id}
                                room={room}
                                onClick={onRoomClick}
                            />
                        ))}
                    </div>
                </section>
            ))}

            {/* ── Legend ───────────────────────────────────────────── */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-4 border-t border-border">
                {LEGEND.map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                        <span className={`w-3 h-3 rounded-sm ${color}`} />
                        <span className="text-xs text-muted-foreground">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}