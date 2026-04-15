"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Loader2, Plus, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SettingsSection, FieldLabel } from "./SettingsShared";
import {
    useRooms, useRoomBlocks,
    useCreateRoomBlock, useResolveRoomBlock,
} from "@/hooks/rooms/useRooms";
import type { RoomBlockReason } from "@/types";

const REASONS: Array<{ value: RoomBlockReason; label: string }> = [
    { value: "maintenance", label: "Maintenance" },
    { value: "renovation", label: "Renovation" },
    { value: "vip_hold", label: "VIP hold" },
    { value: "deep_cleaning", label: "Deep cleaning" },
    { value: "other", label: "Other" },
];

const fmt = (v?: string) => {
    if (!v) return "—";
    const d = new Date(v);
    return isNaN(d.getTime()) ? v : format(d, "dd MMM yyyy, HH:mm");
};

export function RoomBlockSettings() {
    const { data: roomsData } = useRooms({ page: 1, limit: 200 });
    const { data: blocks = [] } = useRoomBlocks();
    const createMutation = useCreateRoomBlock();
    const resolveMutation = useResolveRoomBlock();

    const rooms = roomsData?.rooms ?? [];

    const [roomId, setRoomId] = useState("");
    const [reason, setReason] = useState<RoomBlockReason>("maintenance");
    const [from, setFrom] = useState("");
    const [until, setUntil] = useState("");
    const [notes, setNotes] = useState("");
    const [resolveNotes, setResolveNotes] = useState<Record<string, string>>({});

    const handleCreate = () => {
        if (!roomId || !from || !until) return;
        createMutation.mutate(
            { room: roomId, reason, blockedFrom: from, blockedUntil: until, notes: notes.trim() || undefined },
            { onSuccess: () => { setRoomId(""); setFrom(""); setUntil(""); setNotes(""); } }
        );
    };

    const activeBlocks = blocks.filter((b) => b.isActive);
    const resolvedBlocks = blocks.filter((b) => !b.isActive);

    return (
        <div className="space-y-4">
            {/* Create */}
            <SettingsSection
                title="Block a room"
                description="Prevent a room from being booked for maintenance, renovation, or VIP holds."
            >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                        <FieldLabel required>Room</FieldLabel>
                        <Select value={roomId} onValueChange={setRoomId}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select room" /></SelectTrigger>
                            <SelectContent>
                                {rooms.map((r) => (
                                    <SelectItem key={r._id} value={r._id}>
                                        {r.roomNumber} · {r.roomType?.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <FieldLabel>Reason</FieldLabel>
                        <Select value={reason} onValueChange={(v) => setReason(v as RoomBlockReason)}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {REASONS.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <FieldLabel required>Blocked from</FieldLabel>
                        <Input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 text-sm" />
                    </div>
                    <div>
                        <FieldLabel required>Blocked until</FieldLabel>
                        <Input type="datetime-local" value={until} onChange={(e) => setUntil(e.target.value)} className="h-9 text-sm" />
                    </div>
                </div>

                <div>
                    <FieldLabel>Notes</FieldLabel>
                    <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Bathroom plumbing repair scheduled"
                        rows={2}
                        className="text-sm resize-none"
                    />
                </div>

                <div className="flex justify-end">
                    <Button
                        onClick={handleCreate}
                        disabled={createMutation.isPending || !roomId || !from || !until}
                        className="gap-1.5"
                    >
                        {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Create block
                    </Button>
                </div>
            </SettingsSection>

            {/* Active blocks */}
            {activeBlocks.length > 0 && (
                <SettingsSection
                    title={`Active blocks (${activeBlocks.length})`}
                    description="These rooms are currently blocked."
                >
                    <div className="divide-y divide-border">
                        {activeBlocks.map((block) => (
                            <div key={block._id} className="py-3 space-y-2">
                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                    <div className="min-w-0 space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-foreground">
                                                Room {block.room?.roomNumber}
                                            </span>
                                            <Badge variant="outline" className="text-[10px] capitalize">
                                                {block.reason.replace(/_/g, " ")}
                                            </Badge>
                                            <Badge className="text-[10px] bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0">
                                                Active
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {fmt(block.blockedFrom)} → {fmt(block.blockedUntil)}
                                        </p>
                                        {block.notes && (
                                            <p className="text-xs text-muted-foreground/70">{block.notes}</p>
                                        )}
                                    </div>

                                    {/* Resolve inline */}
                                    <div className="flex items-center gap-2">
                                        <Input
                                            placeholder="Resolution note (optional)"
                                            value={resolveNotes[block._id] ?? ""}
                                            onChange={(e) =>
                                                setResolveNotes((s) => ({ ...s, [block._id]: e.target.value }))
                                            }
                                            className="h-8 text-xs w-48"
                                        />
                                        <Button
                                            variant="outline" size="sm"
                                            className="h-8 text-xs gap-1 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                                            onClick={() =>
                                                resolveMutation.mutate({
                                                    id: block._id,
                                                    payload: { notes: resolveNotes[block._id] || undefined },
                                                })
                                            }
                                            disabled={resolveMutation.isPending}
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Resolve
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </SettingsSection>
            )}

            {/* Resolved blocks */}
            {resolvedBlocks.length > 0 && (
                <SettingsSection title="Resolved blocks">
                    <div className="divide-y divide-border">
                        {resolvedBlocks.map((block) => (
                            <div key={block._id} className="py-2.5 flex items-center justify-between gap-3 opacity-60">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-foreground">
                                            Room {block.room?.roomNumber}
                                        </span>
                                        <Badge variant="secondary" className="text-[10px] capitalize">
                                            {block.reason.replace(/_/g, " ")}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {fmt(block.blockedFrom)} → {fmt(block.blockedUntil)}
                                    </p>
                                </div>
                                <Badge variant="secondary" className="text-[10px]">resolved</Badge>
                            </div>
                        ))}
                    </div>
                </SettingsSection>
            )}

            {blocks.length === 0 && (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                    <p className="text-sm text-muted-foreground">No room blocks found.</p>
                </div>
            )}
        </div>
    );
}