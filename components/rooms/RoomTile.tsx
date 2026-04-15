"use client";

import { cn } from "@/lib/utils";
import { ROOM_STATUS_META, type Room } from "@/types";

interface RoomTileProps {
    room: Room;
    onClick: (room: Room) => void;
}

export function RoomTile({ room, onClick }: RoomTileProps) {
    const meta = ROOM_STATUS_META[room.status];

    return (
        <button
            onClick={() => onClick(room)}
            title={`${room.roomNumber} — ${room.roomType.name} — ${meta.label}`}
            className={cn(
                // Layout
                "relative flex flex-col items-center justify-center",
                "w-[72px] h-[72px] rounded-xl border-2",
                "transition-all duration-150 cursor-pointer",
                "hover:scale-105 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",

                // Colour from status meta
                meta.color,
                meta.borderColor,
            )}
        >
            {/* Room number */}
            <span className={cn("text-sm font-bold leading-tight", meta.textColor)}>
                {room.roomNumber}
            </span>

            {/* Room type code */}
            <span className={cn("text-[10px] font-medium opacity-75 mt-0.5", meta.textColor)}>
                {room.roomType.code}
            </span>

            {/* Status dot — occupied shows a pulsing indicator */}
            {room.status === "occupied" && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                </span>
            )}

            {/* OOO / OOS — lock icon overlay */}
            {(room.status === "out_of_order" || room.status === "out_of_service") && (
                <span className="absolute top-1 right-1 text-[10px]">🔒</span>
            )}
        </button>
    );
}