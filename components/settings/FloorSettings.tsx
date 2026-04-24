"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SettingsSection, SettingsDivider, FieldLabel } from "./SettingsShared";
import { useFloors, useCreateFloor, useUpdateFloor } from "@/hooks/settings/useSettings";

export function FloorSettings() {
    const { data: floors = [] } = useFloors();
    const createMutation = useCreateFloor();
    const updateMutation = useUpdateFloor();

    const [num, setNum] = useState("1");
    const [label, setLabel] = useState("");

    const [selectedId, setSelectedId] = useState("");
    const [selectedLabel, setSelectedLabel] = useState("");
    const [selectedActive, setSelectedActive] = useState(true);

    useEffect(() => {
        if (!selectedId) return;
        const floor = floors.find((f) => f._id === selectedId);
        if (!floor) return;
        setSelectedLabel(floor.label ?? "");
        setSelectedActive(floor.isActive);
    }, [selectedId, floors]);

    return (
        <div className="space-y-4">
            {/* Create */}
            <SettingsSection
                title="Add floor"
                description="Add a new floor to the property."
            >
                <div className="flex flex-wrap items-end gap-3">
                    <div className="w-28">
                        <FieldLabel required>Floor number</FieldLabel>
                        <Input
                            type="number" min={0}
                            value={num}
                            onChange={(e) => setNum(e.target.value)}
                            className="h-9 text-sm"
                        />
                    </div>
                    <div className="flex-1 min-w-40">
                        <FieldLabel>Display label</FieldLabel>
                        <Input
                            placeholder="e.g. Ground floor, Level 3"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            className="h-9 text-sm"
                        />
                    </div>
                    <Button
                        onClick={() => {
                            createMutation.mutate({
                                floorNumber: Number(num),
                                label: label.trim() || undefined,
                            });
                            setLabel("");
                        }}
                        disabled={createMutation.isPending}
                        className="gap-1.5"
                    >
                        {createMutation.isPending
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Plus className="w-4 h-4" />
                        }
                        Add floor
                    </Button>
                </div>
            </SettingsSection>

            {/* Edit */}
            <SettingsSection
                title="Edit floor"
                description="Update the label or active status of an existing floor."
            >
                <div className="flex flex-wrap items-end gap-3">
                    <div className="w-48">
                        <FieldLabel>Select floor</FieldLabel>
                        <Select value={selectedId} onValueChange={setSelectedId}>
                            <SelectTrigger className="h-9 text-sm">
                                <SelectValue placeholder="Choose a floor" />
                            </SelectTrigger>
                            <SelectContent>
                                {floors.map((f) => (
                                    <SelectItem key={f._id} value={f._id}>
                                        {f.label || `Floor ${f.floorNumber}`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1 min-w-40">
                        <FieldLabel>Label</FieldLabel>
                        <Input
                            value={selectedLabel}
                            onChange={(e) => setSelectedLabel(e.target.value)}
                            disabled={!selectedId}
                            className="h-9 text-sm"
                        />
                    </div>
                    <div>
                        <FieldLabel>Active</FieldLabel>
                        <div className="flex items-center h-9">
                            <Switch
                                checked={selectedActive}
                                onCheckedChange={setSelectedActive}
                                disabled={!selectedId}
                            />
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        disabled={!selectedId || updateMutation.isPending}
                        onClick={() =>
                            updateMutation.mutate({
                                id: selectedId,
                                payload: {
                                    label: selectedLabel.trim() || undefined,
                                    isActive: selectedActive,
                                },
                            })
                        }
                    >
                        {updateMutation.isPending
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : "Save"
                        }
                    </Button>
                </div>

                <SettingsDivider />

                {/* Floor list */}
                <div className="flex flex-wrap gap-2">
                    {floors.length === 0 && (
                        <p className="text-sm text-muted-foreground">No floors yet.</p>
                    )}
                    {floors.map((f) => (
                        <button
                            key={f._id}
                            onClick={() => setSelectedId(f._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/40 hover:bg-accent text-xs font-medium transition-colors"
                        >
                            {f.label || `Floor ${f.floorNumber}`}
                            {!f.isActive && (
                                <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                    inactive
                                </Badge>
                            )}
                        </button>
                    ))}
                </div>
            </SettingsSection>
        </div>
    );
}