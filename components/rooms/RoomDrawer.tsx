"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Loader2, BedDouble, Tag, StickyNote, Clock } from "lucide-react";

import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RoomStatusBadge } from "./RoomStatusBadge";
import { useUpdateRoomStatus } from "@/hooks/rooms/useRooms";
import {
    ROOM_STATUS_META,
    type Room,
    type RoomStatus,
} from "@/types";

const ALL_STATUSES = Object.entries(ROOM_STATUS_META) as [RoomStatus, typeof ROOM_STATUS_META[RoomStatus]][];

// ─── Info row ─────────────────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value }: {
    icon: React.ElementType;
    label: string;
    value?: string | number | null;
}) => (
    <div className="flex items-start gap-3 text-sm">
        <Icon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-foreground font-medium">{value ?? "—"}</p>
        </div>
    </div>
);

interface RoomDrawerProps {
    room: Room | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RoomDrawer({ room, open, onOpenChange }: RoomDrawerProps) {
    const [newStatus, setNewStatus] = useState<RoomStatus | "">("");
    const [notes, setNotes] = useState("");

    const updateStatus = useUpdateRoomStatus();

    if (!room) return null;

    const handleStatusUpdate = () => {
        if (!newStatus) return;

        updateStatus.mutate(
            { id: room._id, payload: { status: newStatus, notes: notes || undefined } },
            {
                onSuccess: () => {
                    setNewStatus("");
                    setNotes("");
                    onOpenChange(false);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader className="mb-5 pr-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <BedDouble className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-base">Room {room.roomNumber}</DialogTitle>
                            <DialogDescription className="text-xs">
                                {room.roomType.name} · {room.floor.label ?? `Floor ${room.floor.floorNumber}`}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Current status */}
                <div className="flex items-center justify-between mb-5">
                    <span className="text-sm text-muted-foreground">Current status</span>
                    <RoomStatusBadge status={room.status} />
                </div>

                <Separator className="mb-5" />

                {/* Room details */}
                <div className="space-y-4 mb-6">
                    <InfoRow
                        icon={Tag}
                        label="Room type"
                        value={`${room.roomType.name} (${room.roomType.code})`}
                    />
                    <InfoRow
                        icon={BedDouble}
                        label="Bed type"
                        value={room.roomType.bedType}
                    />
                    <InfoRow
                        icon={Clock}
                        label="Last cleaned"
                        value={
                            room.lastCleanedAt
                                ? format(new Date(room.lastCleanedAt), "dd MMM yyyy, HH:mm")
                                : null
                        }
                    />
                    <InfoRow
                        icon={Clock}
                        label="Last inspected"
                        value={
                            room.lastInspectedAt
                                ? format(new Date(room.lastInspectedAt), "dd MMM yyyy, HH:mm")
                                : null
                        }
                    />
                    {room.features && room.features.length > 0 && (
                        <div className="flex items-start gap-3 text-sm">
                            <Tag className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Features</p>
                                <div className="flex flex-wrap gap-1">
                                    {room.features.map((f) => (
                                        <span
                                            key={f}
                                            className="px-2 py-0.5 bg-muted text-xs rounded-full text-foreground"
                                        >
                                            {f}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {room.notes && (
                        <InfoRow icon={StickyNote} label="Notes" value={room.notes} />
                    )}
                </div>

                <Separator className="mb-5" />

                {/* ── Change status ─────────────────────────────────── */}
                <div className="space-y-4">
                    <p className="text-sm font-semibold">Update status</p>

                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">New status</Label>
                        <Select
                            value={newStatus}
                            onValueChange={(v) => setNewStatus(v as RoomStatus)}
                        >
                            <SelectTrigger className="h-9 text-sm">
                                <SelectValue placeholder="Select status…" />
                            </SelectTrigger>
                            <SelectContent>
                                {ALL_STATUSES
                                    .filter(([status]) => status !== room.status)
                                    .map(([status, meta]) => (
                                        <SelectItem key={status} value={status}>
                                            {meta.label}
                                        </SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">
                            Notes <span className="text-muted-foreground/60">(optional)</span>
                        </Label>
                        <Textarea
                            placeholder="e.g. Deep cleaned, extra towels added…"
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="text-sm resize-none"
                        />
                    </div>

                    <Button
                        className="w-full"
                        disabled={!newStatus || updateStatus.isPending}
                        onClick={handleStatusUpdate}
                    >
                        {updateStatus.isPending
                            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating…</>
                            : "Update status"
                        }
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}