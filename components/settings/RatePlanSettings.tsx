"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Pencil, TrendingDown, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SettingsSection, SettingsDivider, FieldLabel } from "./SettingsShared";
import {
    useRatePlans, useRatePlan, useRatePlanPreview, useRoomTypes,
    useCreateRatePlan, useUpdateRatePlan, useDeactivateRatePlan,
} from "@/hooks/settings/useSettings";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import type { CreateRatePlanPayload, UpdateRatePlanPayload, RatePlanAdjustmentType } from "@/types";

const EMPTY: CreateRatePlanPayload = {
    name: "", code: "", description: "",
    applicableRoomTypes: [],
    adjustmentType: "percent", adjustmentValue: 0,
    isPublic: true, isActive: true,
};

export function RatePlanSettings() {
    const { data: ratePlans = [] } = useRatePlans();
    const { data: roomTypes = [] } = useRoomTypes();
    const createMutation = useCreateRatePlan();
    const updateMutation = useUpdateRatePlan();
    const deactivateMutation = useDeactivateRatePlan();

    const [createForm, setCreateForm] = useState<CreateRatePlanPayload>(EMPTY);
    const [editId, setEditId] = useState("");
    const [editForm, setEditForm] = useState<UpdateRatePlanPayload>({});
    const [deactivateId, setDeactivateId] = useState("");

    const { data: editTarget } = useRatePlan(editId);
    const { data: preview } = useRatePlanPreview(editId);

    useEffect(() => {
        if (!editTarget) return;
        setEditForm({
            name: editTarget.name,
            description: editTarget.description ?? "",
            isPublic: editTarget.isPublic,
            isActive: editTarget.isActive,
            adjustmentType: editTarget.adjustmentType,
            adjustmentValue: editTarget.adjustmentValue,
        });
    }, [editTarget]);

    const toggleRoomType = (id: string) => {
        setCreateForm((s) => ({
            ...s,
            applicableRoomTypes: (s.applicableRoomTypes ?? []).includes(id)
                ? (s.applicableRoomTypes ?? []).filter((x) => x !== id)
                : [...(s.applicableRoomTypes ?? []), id],
        }));
    };

    return (
        <div className="space-y-4">
            {/* Create */}
            <SettingsSection
                title="Create rate plan"
                description="Rate plans adjust room prices by a flat amount or percentage."
            >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="col-span-2">
                        <FieldLabel required>Name</FieldLabel>
                        <Input value={createForm.name} onChange={(e) => setCreateForm((s) => ({ ...s, name: e.target.value }))} className="h-9 text-sm" />
                    </div>
                    <div>
                        <FieldLabel required>Code</FieldLabel>
                        <Input value={createForm.code} onChange={(e) => setCreateForm((s) => ({ ...s, code: e.target.value.toUpperCase() }))} placeholder="CORP" className="h-9 text-sm font-mono" />
                    </div>
                    <div className="flex items-center gap-3 pt-5">
                        <Switch checked={createForm.isPublic} onCheckedChange={(v) => setCreateForm((s) => ({ ...s, isPublic: v }))} />
                        <span className="text-sm text-muted-foreground">Public</span>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <FieldLabel>Adjustment type</FieldLabel>
                        <Select
                            value={createForm.adjustmentType as string}
                            onValueChange={(v) => setCreateForm((s) => ({ ...s, adjustmentType: v as RatePlanAdjustmentType }))}
                        >
                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="percent">Percent (%)</SelectItem>
                                <SelectItem value="flat">Flat (₹)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <FieldLabel>
                            Adjustment value
                            <span className="ml-1 text-muted-foreground font-normal">
                                (negative = discount)
                            </span>
                        </FieldLabel>
                        <Input
                            type="number"
                            value={createForm.adjustmentValue ?? 0}
                            onChange={(e) => setCreateForm((s) => ({ ...s, adjustmentValue: Number(e.target.value) }))}
                            className="h-9 text-sm"
                        />
                    </div>
                </div>

                <div>
                    <FieldLabel>Description</FieldLabel>
                    <Textarea
                        value={createForm.description ?? ""}
                        onChange={(e) => setCreateForm((s) => ({ ...s, description: e.target.value }))}
                        rows={2} className="text-sm resize-none"
                    />
                </div>

                <div>
                    <FieldLabel>Applicable room types</FieldLabel>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {roomTypes.map((rt) => {
                            const selected = (createForm.applicableRoomTypes ?? []).includes(rt._id);
                            return (
                                <button
                                    key={rt._id}
                                    type="button"
                                    onClick={() => toggleRoomType(rt._id)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${selected
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "border-border text-muted-foreground hover:border-foreground/30"
                                        }`}
                                >
                                    {rt.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button
                        onClick={() => createMutation.mutate(createForm)}
                        disabled={createMutation.isPending || !createForm.name || !createForm.code}
                        className="gap-1.5"
                    >
                        {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Create rate plan
                    </Button>
                </div>
            </SettingsSection>

            {/* List + edit */}
            <SettingsSection title="Rate plans">
                <div className="divide-y divide-border">
                    {ratePlans.length === 0 && (
                        <p className="py-4 text-sm text-muted-foreground">No rate plans yet.</p>
                    )}
                    {ratePlans.map((plan) => (
                        <div key={plan._id} className="py-3 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-medium text-foreground">{plan.name}</span>
                                        <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{plan.code}</span>
                                        {!plan.isActive && <Badge variant="secondary" className="text-[10px]">inactive</Badge>}
                                        {plan.isPublic && <Badge variant="outline" className="text-[10px]">public</Badge>}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                        {(plan.adjustmentValue ?? 0) < 0
                                            ? <TrendingDown className="w-3 h-3 text-green-500" />
                                            : <TrendingUp className="w-3 h-3 text-orange-500" />
                                        }
                                        {plan.adjustmentType === "percent"
                                            ? `${plan.adjustmentValue}% adjustment`
                                            : `₹${plan.adjustmentValue} flat adjustment`
                                        }
                                    </p>
                                </div>
                                <div className="flex gap-1.5">
                                    <Button
                                        variant="ghost" size="sm"
                                        className="h-7 text-xs gap-1"
                                        onClick={() => setEditId(editId === plan._id ? "" : plan._id)}
                                    >
                                        <Pencil className="w-3.5 h-3.5" /> Edit
                                    </Button>
                                    <Button
                                        variant="ghost" size="sm"
                                        className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => setDeactivateId(plan._id)}
                                        disabled={!plan.isActive}
                                    >
                                        Deactivate
                                    </Button>
                                </div>
                            </div>

                            {/* Inline edit panel */}
                            {editId === plan._id && (
                                <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-4">
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        <div>
                                            <FieldLabel>Name</FieldLabel>
                                            <Input value={editForm.name ?? ""} onChange={(e) => setEditForm((s) => ({ ...s, name: e.target.value }))} className="h-9 text-sm" />
                                        </div>
                                        <div>
                                            <FieldLabel>Description</FieldLabel>
                                            <Input value={editForm.description ?? ""} onChange={(e) => setEditForm((s) => ({ ...s, description: e.target.value }))} className="h-9 text-sm" />
                                        </div>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        <div>
                                            <FieldLabel>Adjustment type</FieldLabel>
                                            <Select value={editForm.adjustmentType as string} onValueChange={(v) => setEditForm((s) => ({ ...s, adjustmentType: v as RatePlanAdjustmentType }))}>
                                                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="percent">Percent</SelectItem>
                                                    <SelectItem value="flat">Flat</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <FieldLabel>Adjustment value</FieldLabel>
                                            <Input type="number" value={editForm.adjustmentValue ?? 0} onChange={(e) => setEditForm((s) => ({ ...s, adjustmentValue: Number(e.target.value) }))} className="h-9 text-sm" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm">
                                        <label className="flex items-center gap-2">
                                            <Switch checked={Boolean(editForm.isPublic)} onCheckedChange={(v) => setEditForm((s) => ({ ...s, isPublic: v }))} />
                                            Public
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <Switch checked={Boolean(editForm.isActive)} onCheckedChange={(v) => setEditForm((s) => ({ ...s, isActive: v }))} />
                                            Active
                                        </label>
                                    </div>

                                    {/* Preview */}
                                    {preview && (
                                        <div className="space-y-2">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                Rate preview · {preview.currentlyValid ? "Currently valid" : `Not valid · ${preview.reason}`}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {preview.preview.map((item) => (
                                                    <div key={item.roomType._id} className="text-xs bg-card border border-border rounded-lg px-3 py-2">
                                                        <p className="font-medium">{item.roomType.name}</p>
                                                        <p className="text-muted-foreground">
                                                            ₹{item.baseRate} → <span className="text-foreground font-semibold">₹{item.effectiveRate}</span>
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => updateMutation.mutate({ id: editId, payload: editForm })}
                                            disabled={updateMutation.isPending}
                                        >
                                            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save changes"}
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => setEditId("")}>Cancel</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </SettingsSection>

            <ConfirmDialog
                open={!!deactivateId}
                onOpenChange={(open) => { if (!open) setDeactivateId(""); }}
                title="Deactivate rate plan?"
                description="This rate plan will no longer be available for new reservations."
                confirmLabel="Deactivate"
                variant="destructive"
                isPending={deactivateMutation.isPending}
                onConfirm={() =>
                    deactivateMutation.mutate(deactivateId, {
                        onSuccess: () => setDeactivateId(""),
                    })
                }
            />
        </div>
    );
}