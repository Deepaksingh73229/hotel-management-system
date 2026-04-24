"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Plus, Trash2, RefreshCw, Loader2,
    ShieldCheck, ChevronDown, ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Skeleton } from "@/components/ui/skeleton";

import {
    usePermissions,
    useSeedPermissions,
    useDeletePermission,
} from "@/hooks/roles/useRoles";
import * as roleService from "@/services/role.service";
import client from "@/services/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { roleKeys } from "@/hooks/roles/useRoles";
import { cn } from "@/lib/utils";
import type { PermissionModule, PermissionAction, Permission } from "@/services/role.service";

const { PERMISSION_MODULES, PERMISSION_ACTIONS } = roleService;

// ─── Action colours ───────────────────────────────────────────────────────────
const ACTION_COLORS: Record<PermissionAction, string> = {
    read: "bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400   border-blue-200   dark:border-blue-800",
    create: "bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400  border-green-200  dark:border-green-800",
    update: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    delete: "bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400    border-red-200    dark:border-red-800",
    approve: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    export: "bg-cyan-100   text-cyan-700   dark:bg-cyan-900/30   dark:text-cyan-400   border-cyan-200   dark:border-cyan-800",
};

// ─── Create permission schema ──────────────────────────────────────────────────
const schema = z.object({
    module: z.enum(PERMISSION_MODULES as [PermissionModule, ...PermissionModule[]]),
    action: z.enum(PERMISSION_ACTIONS as [PermissionAction, ...PermissionAction[]]),
    description: z.string().trim().max(200).optional(),
});

type FormValues = z.infer<typeof schema>;

// ─────────────────────────────────────────────────────────────────────────────

function useCreatePermission() {
    const qc = useQueryClient();
    const [isPending, setIsPending] = useState(false);

    const create = async (payload: roleService.CreatePermissionPayload) => {
        setIsPending(true);
        try {
            await roleService.createPermission(payload);
            qc.invalidateQueries({ queryKey: roleKeys.permissions });
            toast.success(`Permission ${payload.module}:${payload.action} created.`);
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to create permission.");
        } finally {
            setIsPending(false);
        }
    };

    return { create, isPending };
}

export function PermissionManager() {
    const { data: permissions = [], isLoading } = usePermissions();
    const seedMutation = useSeedPermissions();
    const deleteMutation = useDeletePermission();
    const { create, isPending: creating } = useCreatePermission();

    const [deleteTarget, setDeleteTarget] = useState<Permission | null>(null);
    const [openModules, setOpenModules] = useState<Set<string>>(new Set(PERMISSION_MODULES));

    const { register, handleSubmit, control, reset, formState: { errors } } =
        useForm<FormValues>({ resolver: zodResolver(schema) });

    const onSubmit = async (values: FormValues) => {
        await create(values);
        reset();
    };

    // Group permissions by module
    const byModule = PERMISSION_MODULES.reduce<Record<string, Permission[]>>((acc, mod) => {
        acc[mod] = permissions.filter((p) => p.module === mod);
        return acc;
    }, {} as Record<string, Permission[]>);

    const toggleModule = (mod: string) =>
        setOpenModules((prev) => {
            const next = new Set(prev);
            next.has(mod) ? next.delete(mod) : next.add(mod);
            return next;
        });

    return (
        <div className="space-y-5">

            {/* ── Seed + Add form ──────────────────────────────────── */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                        <p className="text-sm font-semibold text-foreground">Permissions</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {permissions.length} permission{permissions.length !== 1 ? "s" : ""} across {PERMISSION_MODULES.length} modules
                        </p>
                    </div>
                    <Button
                        variant="outline" size="sm"
                        onClick={() => seedMutation.mutate()}
                        disabled={seedMutation.isPending}
                        className="gap-1.5"
                    >
                        {seedMutation.isPending
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <RefreshCw className="w-4 h-4" />
                        }
                        Seed all
                    </Button>
                </div>

                {/* Add single permission form */}
                <div className="border-t border-border pt-4">
                    <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                        Add a permission
                    </p>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Module */}
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Module *</Label>
                                <Controller
                                    name="module"
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className={cn("h-9 text-sm", errors.module && "border-destructive")}>
                                                <SelectValue placeholder="Select module" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PERMISSION_MODULES.map((m) => (
                                                    <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.module && <p className="text-xs text-destructive">{errors.module.message}</p>}
                            </div>

                            {/* Action */}
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Action *</Label>
                                <Controller
                                    name="action"
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className={cn("h-9 text-sm", errors.action && "border-destructive")}>
                                                <SelectValue placeholder="Select action" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PERMISSION_ACTIONS.map((a) => (
                                                    <SelectItem key={a} value={a} className="capitalize">{a}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.action && <p className="text-xs text-destructive">{errors.action.message}</p>}
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Description (optional)</Label>
                                <Input
                                    {...register("description")}
                                    placeholder="What this permission allows"
                                    className="h-9 text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end mt-3">
                            <Button type="submit" size="sm" disabled={creating} className="gap-1.5">
                                {creating
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <Plus className="w-4 h-4" />
                                }
                                Add permission
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* ── Permissions list grouped by module ───────────────── */}
            {isLoading && (
                <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full rounded-xl" />
                    ))}
                </div>
            )}

            {!isLoading && permissions.length === 0 && (
                <div className="bg-card border border-dashed border-border rounded-xl p-10 text-center space-y-2">
                    <ShieldCheck className="w-8 h-8 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">No permissions yet. Click <strong>Seed all</strong> to get started.</p>
                </div>
            )}

            {!isLoading && permissions.length > 0 && (
                <div className="space-y-2">
                    {PERMISSION_MODULES.map((mod) => {
                        const perms = byModule[mod] ?? [];
                        const isOpen = openModules.has(mod);

                        return (
                            <div key={mod} className="bg-card border border-border rounded-xl overflow-hidden">
                                {/* Module header */}
                                <button
                                    type="button"
                                    onClick={() => toggleModule(mod)}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        {isOpen
                                            ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                            : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                        }
                                        <span className="text-sm font-medium text-foreground capitalize">{mod}</span>
                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                            {perms.length}
                                        </Badge>
                                    </div>
                                    {perms.length === 0 && (
                                        <span className="text-xs text-muted-foreground">No permissions</span>
                                    )}
                                </button>

                                {/* Permission pills */}
                                {isOpen && perms.length > 0 && (
                                    <div className="border-t border-border px-4 py-3">
                                        <div className="flex flex-wrap gap-2">
                                            {PERMISSION_ACTIONS.map((action) => {
                                                const perm = perms.find((p) => p.action === action);
                                                if (!perm) return null;

                                                return (
                                                    <div
                                                        key={perm._id}
                                                        className={cn(
                                                            "group flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full",
                                                            "text-xs font-medium border",
                                                            ACTION_COLORS[action]
                                                        )}
                                                    >
                                                        <span className="capitalize">{action}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteTarget(perm)}
                                                            className="opacity-50 hover:opacity-100 transition-opacity rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
                                                            title={`Delete ${mod}:${action}`}
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {/* Description if present */}
                                        {perms.some((p) => p.description) && (
                                            <div className="mt-2 space-y-0.5">
                                                {perms.filter((p) => p.description).map((p) => (
                                                    <p key={p._id} className="text-xs text-muted-foreground">
                                                        <span className="font-medium capitalize">{p.action}:</span> {p.description}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Delete confirm */}
            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                title="Delete permission?"
                description={
                    deleteTarget
                        ? `"${deleteTarget.module}:${deleteTarget.action}" will be permanently deleted and removed from all roles that use it.`
                        : ""
                }
                confirmLabel="Delete"
                variant="destructive"
                isPending={deleteMutation.isPending}
                onConfirm={() =>
                    deleteTarget &&
                    deleteMutation.mutate(deleteTarget._id, {
                        onSuccess: () => setDeleteTarget(null),
                    })
                }
            />
        </div>
    );
}