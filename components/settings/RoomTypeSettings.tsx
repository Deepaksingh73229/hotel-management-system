"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SettingsSection, SettingsDivider, FieldLabel } from "./SettingsShared";
import {
    useRoomTypes, useRoomType,
    useCreateRoomType, useUpdateRoomType,
} from "@/hooks/settings/useSettings";
import type { CreateRoomTypePayload } from "@/types";

const EMPTY: CreateRoomTypePayload = {
    name: "", code: "", description: "",
    maxOccupancy: 2, maxAdults: 2, maxChildren: 0,
    baseRate: 0, bedType: "queen",
    amenities: [], sortOrder: 1, isActive: true,
};

const BED_TYPES = ["single", "double", "king", "queen", "twin", "bunk"] as const;

const splitCsv = (v: string) =>
    v.split(",").map((s) => s.trim()).filter(Boolean);

export function RoomTypeSettings() {
    const { data: roomTypes = [] } = useRoomTypes();
    const createMutation = useCreateRoomType();
    const updateMutation = useUpdateRoomType();

    const [form, setForm] = useState<CreateRoomTypePayload>(EMPTY);
    const [amenityCsv, setAmenityCsv] = useState("");
    const [editId, setEditId] = useState("");

    const { data: editTarget } = useRoomType(editId);

    useEffect(() => {
        if (!editTarget) return;
        setForm({
            name: editTarget.name,
            code: editTarget.code,
            description: editTarget.description ?? "",
            maxOccupancy: editTarget.maxOccupancy,
            maxAdults: editTarget.maxAdults,
            maxChildren: editTarget.maxChildren,
            baseRate: editTarget.baseRate,
            bedType: editTarget.bedType,
            amenities: editTarget.amenities ?? [],
            sortOrder: editTarget.sortOrder,
            isActive: editTarget.isActive,
        });
        setAmenityCsv((editTarget.amenities ?? []).join(", "));
    }, [editTarget]);

    const set = (key: keyof CreateRoomTypePayload, val: unknown) =>
        setForm((s) => ({ ...s, [key]: val }));

    const payload = { ...form, amenities: splitCsv(amenityCsv) };

    const handleSave = () => {
        if (editId) {
            updateMutation.mutate({ id: editId, payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="space-y-4">
            {/* Form */}
            <SettingsSection
                title={editId ? "Edit room type" : "Add room type"}
                description="Define the categories of rooms available at your property."
            >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="col-span-2">
                        <FieldLabel required>Name</FieldLabel>
                        <Input value={form.name} onChange={(e) => set("name", e.target.value)} className="h-9 text-sm" />
                    </div>
                    <div>
                        <FieldLabel required>Code</FieldLabel>
                        <Input
                            value={form.code}
                            onChange={(e) => set("code", e.target.value.toUpperCase())}
                            placeholder="DLX"
                            className="h-9 text-sm font-mono"
                        />
                    </div>
                    <div>
                        <FieldLabel>Base rate (₹)</FieldLabel>
                        <Input
                            type="number" min={0}
                            value={form.baseRate}
                            onChange={(e) => set("baseRate", Number(e.target.value))}
                            className="h-9 text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                        <FieldLabel>Bed type</FieldLabel>
                        <Select value={form.bedType ?? "queen"} onValueChange={(v) => set("bedType", v)}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {BED_TYPES.map((b) => (
                                    <SelectItem key={b} value={b} className="capitalize">{b}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <FieldLabel>Max occupancy</FieldLabel>
                        <Input type="number" min={1} value={form.maxOccupancy} onChange={(e) => set("maxOccupancy", Number(e.target.value))} className="h-9 text-sm" />
                    </div>
                    <div>
                        <FieldLabel>Max adults</FieldLabel>
                        <Input type="number" min={1} value={form.maxAdults} onChange={(e) => set("maxAdults", Number(e.target.value))} className="h-9 text-sm" />
                    </div>
                    <div>
                        <FieldLabel>Max children</FieldLabel>
                        <Input type="number" min={0} value={form.maxChildren} onChange={(e) => set("maxChildren", Number(e.target.value))} className="h-9 text-sm" />
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <FieldLabel>Amenities (comma-separated)</FieldLabel>
                        <Input
                            value={amenityCsv}
                            onChange={(e) => setAmenityCsv(e.target.value)}
                            placeholder="WiFi, AC, TV, Mini Bar"
                            className="h-9 text-sm"
                        />
                    </div>
                    <div>
                        <FieldLabel>Sort order</FieldLabel>
                        <Input type="number" min={0} value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} className="h-9 text-sm" />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Switch checked={form.isActive} onCheckedChange={(v) => set("isActive", v)} />
                    <span className="text-sm text-muted-foreground">Active</span>
                </div>

                <div className="flex gap-2 pt-1">
                    <Button onClick={handleSave} disabled={isPending} className="gap-1.5">
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        {editId ? "Save changes" : "Create room type"}
                    </Button>
                    {editId && (
                        <Button variant="ghost" onClick={() => { setEditId(""); setForm(EMPTY); setAmenityCsv(""); }}>
                            Cancel
                        </Button>
                    )}
                </div>
            </SettingsSection>

            {/* List */}
            <SettingsSection title="Existing room types">
                <div className="divide-y divide-border">
                    {roomTypes.length === 0 && (
                        <p className="py-4 text-sm text-muted-foreground">No room types yet.</p>
                    )}
                    {roomTypes.map((rt) => (
                        <div key={rt._id} className="flex items-center justify-between py-3 gap-3">
                            <div className="min-w-0 space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-foreground">{rt.name}</span>
                                    <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                        {rt.code}
                                    </span>
                                    {!rt.isActive && (
                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">inactive</Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {rt.bedType} · Max {rt.maxOccupancy} · ₹{rt.baseRate.toLocaleString("en-IN")}/night
                                </p>
                                {rt.amenities && rt.amenities.length > 0 && (
                                    <p className="text-xs text-muted-foreground/70">{rt.amenities.join(", ")}</p>
                                )}
                            </div>
                            <Button
                                variant="ghost" size="sm"
                                className="flex-shrink-0 gap-1 text-xs"
                                onClick={() => setEditId(rt._id)}
                            >
                                <Pencil className="w-3.5 h-3.5" /> Edit
                            </Button>
                        </div>
                    ))}
                </div>
            </SettingsSection>
        </div>
    );
}