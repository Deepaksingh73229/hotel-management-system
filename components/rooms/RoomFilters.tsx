"use client";

import { cn } from "@/lib/utils";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ROOM_STATUS_META, type RoomStatus, type RoomType } from "@/types";

const STATUS_FILTERS: { value: RoomStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "vacant_clean", label: "Vacant clean" },
    { value: "vacant_dirty", label: "Vacant dirty" },
    { value: "occupied", label: "Occupied" },
    { value: "on_change", label: "On change" },
    { value: "out_of_order", label: "Out of order" },
    { value: "out_of_service", label: "Out of service" },
];

interface RoomFiltersProps {
    statusFilter: RoomStatus | "all";
    roomTypeFilter: string;
    roomTypes: RoomType[];
    onStatusChange: (s: RoomStatus | "all") => void;
    onTypeChange: (id: string) => void;
}

export function RoomFilters({
    statusFilter,
    roomTypeFilter,
    roomTypes,
    onStatusChange,
    onTypeChange,
}: RoomFiltersProps) {
    return (
        <div className="flex flex-wrap items-center gap-3">

            {/* Status pills */}
            <div className="flex flex-wrap gap-1.5">
                {STATUS_FILTERS.map(({ value, label }) => {
                    const isActive = statusFilter === value;
                    const meta = value !== "all" ? ROOM_STATUS_META[value] : null;

                    return (
                        <button
                            key={value}
                            onClick={() => onStatusChange(value as RoomStatus | "all")}
                            className={cn(
                                "px-3 py-1 rounded-full text-xs font-medium border transition-all",
                                isActive
                                    ? meta
                                        ? `${meta.color} ${meta.textColor} ${meta.borderColor}`
                                        : "bg-foreground text-background border-foreground"
                                    : "bg-transparent text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                            )}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            {/* Room type dropdown */}
            {roomTypes.length > 0 && (
                <Select value={roomTypeFilter} onValueChange={onTypeChange}>
                    <SelectTrigger className="w-44 h-8 text-xs">
                        <SelectValue placeholder="All room types" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All room types</SelectItem>
                        {roomTypes.map((rt) => (
                            <SelectItem key={rt._id} value={rt._id}>
                                {rt.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </div>
    );
}