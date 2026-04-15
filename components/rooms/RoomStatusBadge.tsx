import { cn } from "@/lib/utils";
import { ROOM_STATUS_META, type RoomStatus } from "@/types";

interface RoomStatusBadgeProps {
    status: RoomStatus;
    className?: string;
}

export function RoomStatusBadge({ status, className }: RoomStatusBadgeProps) {
    const meta = ROOM_STATUS_META[status];
    if (!meta) return null;

    return (
        <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
            meta.color,
            meta.textColor,
            meta.borderColor,
            className
        )}>
            {meta.label}
        </span>
    );
}