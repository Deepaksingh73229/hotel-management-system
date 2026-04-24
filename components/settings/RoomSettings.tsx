"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { RoomStatusBadge } from "@/components/rooms/RoomStatusBadge";
import { SettingsSection, FieldLabel } from "./SettingsShared";
import { useRooms, useUpdateRoomStatus} from "@/hooks/rooms/useRooms";
import {
    useFloors, useRoomTypes,
    useCreateRoom, useUpdateAnyRoom
} from "@/hooks/settings/useSettings";
import type { CreateRoomPayload, RoomStatus } from "@/types";

const STATUSES: RoomStatus[] = [
    "vacant_clean", "vacant_dirty", "occupied",
    "on_change", "out_of_order", "out_of_service",
];

const splitCsv = (v: string) => v.split(",").map((s) => s.trim()).filter(Boolean);

export function RoomSettings() {
    const { data: roomsData, isLoading } = useRooms({ page: 1, limit: 200 });
    const { data: floors = [] } = useFloors();
    const { data: roomTypes = [] } = useRoomTypes();
    const createMutation = useCreateRoom();
    const updateMutation = useUpdateAnyRoom();
    const updateStatusMutation = useUpdateRoomStatus();

    const rooms = roomsData?.rooms ?? [];

    const [form, setForm] = useState<CreateRoomPayload>({ roomNumber: "", floor: "", roomType: "", features: [], notes: "" });
    const [featureCsv, setFeatureCsv] = useState("");
    const [statusDraft, setStatusDraft] = useState<Record<string, RoomStatus>>({});

    const set = (key: keyof CreateRoomPayload, val: unknown) =>
        setForm((s) => ({ ...s, [key]: val }));

    const handleCreate = () => {
        if (!form.roomNumber || !form.floor || !form.roomType) return;
        createMutation.mutate(
            { ...form, features: splitCsv(featureCsv), notes: form.notes?.trim() || undefined },
            { onSuccess: () => { setForm({ roomNumber: "", floor: "", roomType: "", features: [], notes: "" }); setFeatureCsv(""); } }
        );
    };

    return (
        <div className="space-y-4">
            {/* Create form */}
            <SettingsSection
                title="Add room"
                description="Create individual room records. Assign floor and room type."
            >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                        <FieldLabel required>Room number</FieldLabel>
                        <Input
                            value={form.roomNumber}
                            onChange={(e) => set("roomNumber", e.target.value)}
                            placeholder="101"
                            className="h-9 text-sm"
                        />
                    </div>
                    <div>
                        <FieldLabel required>Floor</FieldLabel>
                        <Select value={form.floor} onValueChange={(v) => set("floor", v)}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                {floors.map((f) => (
                                    <SelectItem key={f._id} value={f._id}>
                                        {f.label || `Floor ${f.floorNumber}`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <FieldLabel required>Room type</FieldLabel>
                        <Select value={form.roomType} onValueChange={(v) => set("roomType", v)}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                {roomTypes.map((rt) => (
                                    <SelectItem key={rt._id} value={rt._id}>
                                        {rt.name} ({rt.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-end">
                        <Button
                            onClick={handleCreate}
                            disabled={createMutation.isPending || !form.roomNumber || !form.floor || !form.roomType}
                            className="gap-1.5 w-full"
                        >
                            {createMutation.isPending
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <Plus className="w-4 h-4" />
                            }
                            Add room
                        </Button>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <FieldLabel>Features (comma-separated)</FieldLabel>
                        <Input
                            value={featureCsv}
                            onChange={(e) => setFeatureCsv(e.target.value)}
                            placeholder="Pool view, Corner room"
                            className="h-9 text-sm"
                        />
                    </div>
                    <div>
                        <FieldLabel>Notes</FieldLabel>
                        <Input
                            value={form.notes ?? ""}
                            onChange={(e) => set("notes", e.target.value)}
                            placeholder="Internal notes about this room"
                            className="h-9 text-sm"
                        />
                    </div>
                </div>
            </SettingsSection>

            {/* Room list */}
            <SettingsSection title="All rooms" description="Update status or toggle active state for each room.">
                <div className="border border-border rounded-xl overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>Room</TableHead>
                                <TableHead>Floor</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Current status</TableHead>
                                <TableHead>Set status</TableHead>
                                <TableHead>Active</TableHead>
                                <TableHead className="w-24">Save</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                                        Loading rooms…
                                    </TableCell>
                                </TableRow>
                            )}
                            {!isLoading && rooms.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                                        No rooms yet. Add one above.
                                    </TableCell>
                                </TableRow>
                            )}
                            {rooms.map((room) => (
                                <TableRow key={room._id}>
                                    <TableCell className="font-medium text-sm">{room.roomNumber}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {room.floor?.label || `Floor ${room.floor?.floorNumber}`}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {room.roomType?.name}
                                    </TableCell>
                                    <TableCell>
                                        <RoomStatusBadge status={room.status} />
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={statusDraft[room._id] ?? room.status}
                                            onValueChange={(v) =>
                                                setStatusDraft((s) => ({ ...s, [room._id]: v as RoomStatus }))
                                            }
                                        >
                                            <SelectTrigger className="h-8 text-xs w-40">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {STATUSES.map((s) => (
                                                    <SelectItem key={s} value={s} className="text-xs">
                                                        {s.replace(/_/g, " ")}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={room.isActive}
                                            onCheckedChange={(checked) =>
                                                updateMutation.mutate({ id: room._id, payload: { isActive: checked } })
                                            }
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline" size="sm"
                                            className="h-7 text-xs"
                                            onClick={() =>
                                                updateStatusMutation.mutate({
                                                    id: room._id,
                                                    payload: { status: statusDraft[room._id] ?? room.status },
                                                })
                                            }
                                        >
                                            Save
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </SettingsSection>
        </div>
    );
}