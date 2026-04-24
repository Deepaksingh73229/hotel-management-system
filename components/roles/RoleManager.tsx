"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Plus, Pencil, Trash2, Loader2,
    ChevronDown, ChevronRight, Check, X,
    Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PermissionsMatrix } from "./PermissionsMatrix";
import { Skeleton } from "@/components/ui/skeleton";

import {
    useRoles,
    usePermissions,
    useCreateRole,
    useUpdateRole,
    useTogglePermission,
    useSetRolePermissions,
} from "@/hooks/roles/useRoles";
import * as roleService from "@/services/role.service";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { roleKeys } from "@/hooks/roles/useRoles";
import { cn } from "@/lib/utils";
import type { Role } from "@/services/role.service";

const { PERMISSION_MODULES, PERMISSION_ACTIONS } = roleService;

// ─── Role styles ──────────────────────────────────────────────────────────────
const ROLE_BADGE_STYLES: Record<string, string> = {
    admin:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
    front_desk:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800",
};

// ─── Create role schema ───────────────────────────────────────────────────────
const createSchema = z.object({
    name: z.enum(["admin", "front_desk"]),
    displayName: z.string().trim().min(2, "At least 2 characters").max(60),
});

type CreateFormValues = z.infer<typeof createSchema>;

// ─── Edit display name schema ─────────────────────────────────────────────────
const editSchema = z.object({
    displayName: z.string().trim().min(2, "At least 2 characters").max(60),
});

type EditFormValues = z.infer<typeof editSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// SINGLE ROLE ROW
// ─────────────────────────────────────────────────────────────────────────────

function useDeleteRole() {
    const qc = useQueryClient();
    const [isPending, setIsPending] = useState(false);

    const del = async (id: string, name: string) => {
        setIsPending(true);
        try {
            await roleService.updateRole(id, { isActive: false });
            qc.invalidateQueries({ queryKey: roleKeys.allRoles });
            toast.success(`Role "${name}" deactivated.`);
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to deactivate role.");
        } finally {
            setIsPending(false);
        }
    };

    return { del, isPending };
}

interface RoleRowProps {
    role: Role;
}

function RoleRow({ role }: RoleRowProps) {
    const [matrixOpen, setMatrixOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    const updateMutation = useUpdateRole(role._id);
    const { del, isPending: deleting } = useDeleteRole();

    const { register, handleSubmit, reset, formState: { errors } } =
        useForm<EditFormValues>({
            resolver: zodResolver(editSchema),
            defaultValues: { displayName: role.displayName },
        });

    const onSave = (values: EditFormValues) => {
        updateMutation.mutate(
            { displayName: values.displayName },
            { onSuccess: () => setEditing(false) }
        );
    };

    const permCount = role.permissions.length;

    return (
        <>
            <div className="bg-card border border-border rounded-xl overflow-hidden">

                {/* ── Role header ────────────────────────────────── */}
                <div className="flex items-center gap-3 px-5 py-4 flex-wrap">

                    {/* Name badge */}
                    <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0",
                        ROLE_BADGE_STYLES[role.name] ?? ROLE_BADGE_STYLES.front_desk
                    )}>
                        {role.name.replace(/_/g, " ")}
                    </span>

                    {/* Display name — inline edit */}
                    {editing ? (
                        <form
                            onSubmit={handleSubmit(onSave)}
                            className="flex items-center gap-2 flex-1 min-w-0"
                        >
                            <Input
                                {...register("displayName")}
                                className={cn("h-8 text-sm flex-1", errors.displayName && "border-destructive")}
                                autoFocus
                            />
                            <Button type="submit" size="icon" variant="ghost"
                                className="h-8 w-8 text-green-600"
                                disabled={updateMutation.isPending}>
                                {updateMutation.isPending
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <Check className="w-4 h-4" />
                                }
                            </Button>
                            <Button type="button" size="icon" variant="ghost"
                                className="h-8 w-8 text-muted-foreground"
                                onClick={() => { setEditing(false); reset(); }}>
                                <X className="w-4 h-4" />
                            </Button>
                        </form>
                    ) : (
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-foreground">
                                    {role.displayName}
                                </p>
                                {!role.isActive && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                        inactive
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {permCount} permission{permCount !== 1 ? "s" : ""} assigned
                            </p>
                        </div>
                    )}

                    {!editing && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            {/* Active toggle */}
                            <div className="flex items-center gap-1.5 mr-2">
                                <Switch
                                    checked={role.isActive}
                                    onCheckedChange={(v) =>
                                        updateMutation.mutate({ isActive: v })
                                    }
                                    className="scale-75"
                                />
                                <span className="text-xs text-muted-foreground">
                                    {role.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>

                            {/* Edit name */}
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                onClick={() => setEditing(true)}>
                                <Pencil className="w-3.5 h-3.5" />
                            </Button>

                            {/* Deactivate */}
                            <Button
                                variant="ghost" size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => setDeleteConfirm(true)}
                                disabled={!role.isActive}
                                title="Deactivate role"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>

                            {/* Expand permissions matrix */}
                            <Button
                                variant="outline" size="sm"
                                className="h-7 text-xs gap-1 ml-1"
                                onClick={() => setMatrixOpen((v) => !v)}
                            >
                                {matrixOpen
                                    ? <><ChevronDown className="w-3.5 h-3.5" />Hide permissions</>
                                    : <><ChevronRight className="w-3.5 h-3.5" />Assign permissions</>
                                }
                            </Button>
                        </div>
                    )}
                </div>

                {/* ── Permissions matrix ──────────────────────────── */}
                {matrixOpen && (
                    <div className="border-t border-border px-5 py-5">
                        <PermissionsMatrix role={role} />
                    </div>
                )}
            </div>

            {/* Deactivate confirm */}
            <ConfirmDialog
                open={deleteConfirm}
                onOpenChange={setDeleteConfirm}
                title="Deactivate role?"
                description={`The "${role.displayName}" role will be deactivated. Staff with this role will lose access until a different role is assigned.`}
                confirmLabel="Deactivate"
                variant="destructive"
                isPending={deleting}
                onConfirm={() =>
                    del(role._id, role.displayName).then(() => setDeleteConfirm(false))
                }
            />
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROLE MANAGER
// ─────────────────────────────────────────────────────────────────────────────

export function RoleManager() {
    const { data: roles = [], isLoading } = useRoles();
    const createMutation = useCreateRole();
    const [showCreate, setShowCreate] = useState(false);

    const { register, handleSubmit, control, reset, formState: { errors } } =
        useForm<CreateFormValues>({ resolver: zodResolver(createSchema) });

    const onSubmit = (values: CreateFormValues) => {
        createMutation.mutate(values, {
            onSuccess: () => { reset(); setShowCreate(false); },
        });
    };

    return (
        <div className="space-y-4">

            {/* ── Header + create button ───────────────────────────── */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold text-foreground">Roles</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {roles.length} role{roles.length !== 1 ? "s" : ""} configured
                        </p>
                    </div>
                    <Button
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setShowCreate((v) => !v)}
                    >
                        <Plus className="w-4 h-4" />
                        Create role
                    </Button>
                </div>

                {/* Create form */}
                {showCreate && (
                    <div className="border-t border-border pt-4 space-y-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            New role
                        </p>
                        <form onSubmit={handleSubmit(onSubmit)} noValidate>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {/* Name */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Role name *</Label>
                                    <Controller
                                        name="name"
                                        control={control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className={cn("h-9 text-sm", errors.name && "border-destructive")}>
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                    <SelectItem value="front_desk">Front Desk</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                                </div>

                                {/* Display name */}
                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label className="text-xs text-muted-foreground">Display name *</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            {...register("displayName")}
                                            placeholder="e.g. Front Desk Manager"
                                            className={cn("h-9 text-sm flex-1", errors.displayName && "border-destructive")}
                                        />
                                        <Button type="submit" size="sm" className="h-9 gap-1"
                                            disabled={createMutation.isPending}>
                                            {createMutation.isPending
                                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                                : "Create"
                                            }
                                        </Button>
                                        <Button type="button" variant="ghost" size="sm" className="h-9"
                                            onClick={() => { reset(); setShowCreate(false); }}>
                                            Cancel
                                        </Button>
                                    </div>
                                    {errors.displayName && (
                                        <p className="text-xs text-destructive">{errors.displayName.message}</p>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* ── Role list ─────────────────────────────────────────── */}
            {isLoading && (
                <div className="space-y-3">
                    {[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                </div>
            )}

            {!isLoading && roles.length === 0 && (
                <div className="bg-card border border-dashed border-border rounded-xl p-10 text-center space-y-2">
                    <Shield className="w-8 h-8 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">No roles yet. Create one above.</p>
                </div>
            )}

            {!isLoading && roles.map((role) => (
                <RoleRow key={role._id} role={role} />
            ))}
        </div>
    );
}