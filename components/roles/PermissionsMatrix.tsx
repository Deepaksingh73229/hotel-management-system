"use client";

import { useMemo, useState, useCallback } from "react";
import { Loader2, Save, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermissions, useSetRolePermissions } from "@/hooks/roles/useRoles";
import { PERMISSION_MODULES, PERMISSION_ACTIONS } from "@/services/role.service";
import type { Role, PermissionModule, PermissionAction } from "@/services/role.service";

// ─── Action column header colours ─────────────────────────────────────────────
const ACTION_COLORS: Record<PermissionAction, string> = {
    read: "text-blue-600   dark:text-blue-400",
    create: "text-green-600  dark:text-green-400",
    update: "text-orange-600 dark:text-orange-400",
    delete: "text-red-600    dark:text-red-400",
    approve: "text-purple-600 dark:text-purple-400",
    export: "text-cyan-600   dark:text-cyan-400",
};

// ─── Checkbox cell ─────────────────────────────────────────────────────────────
function MatrixCell({
    checked,
    onChange,
    disabled,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    disabled: boolean;
}) {
    return (
        <td className="px-3 py-2.5 text-center">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
                className={cn(
                    "w-4 h-4 rounded border-border",
                    "accent-primary cursor-pointer",
                    "disabled:cursor-not-allowed disabled:opacity-40"
                )}
            />
        </td>
    );
}

interface PermissionsMatrixProps {
    role: Role;
}

export function PermissionsMatrix({ role }: PermissionsMatrixProps) {
    const { data: permissions = [], isLoading } = usePermissions();
    const setPermissionsMutation = useSetRolePermissions(role._id);

    // Local state — tracks which permissions are checked before saving
    const [draft, setDraft] = useState<Set<string>>(() =>
        new Set(role.permissions.map((p) => p._id))
    );

    // Reset draft when role changes
    useMemo(() => {
        setDraft(new Set(role.permissions.map((p) => p._id)));
    }, [role._id, role.permissions]);

    // Build a lookup: module → action → permission._id
    const lookup = useMemo(() => {
        const map = new Map<string, string>(); // key: "module:action" → _id
        permissions.forEach((p) => {
            map.set(`${p.module}:${p.action}`, p._id);
        });
        return map;
    }, [permissions]);

    const isChecked = useCallback(
        (module: PermissionModule, action: PermissionAction) => {
            const id = lookup.get(`${module}:${action}`);
            return id ? draft.has(id) : false;
        },
        [lookup, draft]
    );

    const toggle = useCallback(
        (module: PermissionModule, action: PermissionAction, checked: boolean) => {
            const id = lookup.get(`${module}:${action}`);
            if (!id) return;
            setDraft((prev) => {
                const next = new Set(prev);
                checked ? next.add(id) : next.delete(id);
                return next;
            });
        },
        [lookup]
    );

    // Select / deselect all actions for a module row
    const toggleRow = (module: PermissionModule) => {
        const ids = PERMISSION_ACTIONS
            .map((a) => lookup.get(`${module}:${a}`))
            .filter(Boolean) as string[];

        const allChecked = ids.every((id) => draft.has(id));

        setDraft((prev) => {
            const next = new Set(prev);
            ids.forEach((id) => (allChecked ? next.delete(id) : next.add(id)));
            return next;
        });
    };

    // Select / deselect all modules for an action column
    const toggleCol = (action: PermissionAction) => {
        const ids = PERMISSION_MODULES
            .map((m) => lookup.get(`${m}:${action}`))
            .filter(Boolean) as string[];

        const allChecked = ids.every((id) => draft.has(id));

        setDraft((prev) => {
            const next = new Set(prev);
            ids.forEach((id) => (allChecked ? next.delete(id) : next.add(id)));
            return next;
        });
    };

    const handleSave = () => {
        setPermissionsMutation.mutate({ permissionIds: [...draft] });
    };

    const isDirty = useMemo(() => {
        const original = new Set(role.permissions.map((p) => p._id));
        if (draft.size !== original.size) return true;
        for (const id of draft) { if (!original.has(id)) return true; }
        return false;
    }, [draft, role.permissions]);

    if (isLoading) {
        return (
            <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
            </div>
        );
    }

    if (permissions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Shield className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                    No permissions found. Run the seed first.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Matrix table */}
            <div className="border border-border rounded-xl overflow-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/30">
                            {/* Module column header */}
                            <th className="px-4 py-3 text-left font-semibold text-foreground whitespace-nowrap w-36">
                                Module
                            </th>

                            {/* Action column headers — click to toggle entire column */}
                            {PERMISSION_ACTIONS.map((action) => (
                                <th
                                    key={action}
                                    className="px-3 py-3 text-center font-medium cursor-pointer hover:bg-muted/50 transition-colors select-none"
                                    onClick={() => toggleCol(action)}
                                    title={`Toggle all "${action}" permissions`}
                                >
                                    <span className={cn("capitalize text-xs font-semibold", ACTION_COLORS[action])}>
                                        {action}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-border">
                        {PERMISSION_MODULES.map((module) => {
                            const rowIds = PERMISSION_ACTIONS
                                .map((a) => lookup.get(`${module}:${a}`))
                                .filter(Boolean) as string[];
                            const allChecked = rowIds.length > 0 && rowIds.every((id) => draft.has(id));
                            const someChecked = rowIds.some((id) => draft.has(id));

                            return (
                                <tr
                                    key={module}
                                    className={cn(
                                        "hover:bg-muted/20 transition-colors",
                                        someChecked && "bg-primary/[0.02]"
                                    )}
                                >
                                    {/* Module row label — click to toggle entire row */}
                                    <td
                                        className="px-4 py-2.5 cursor-pointer select-none"
                                        onClick={() => toggleRow(module)}
                                        title={`Toggle all "${module}" permissions`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full flex-shrink-0",
                                                allChecked ? "bg-primary" :
                                                    someChecked ? "bg-primary/40" :
                                                        "bg-border"
                                            )} />
                                            <span className="text-xs font-medium text-foreground capitalize">
                                                {module}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Checkbox cells */}
                                    {PERMISSION_ACTIONS.map((action) => {
                                        const id = lookup.get(`${module}:${action}`);
                                        return (
                                            <MatrixCell
                                                key={action}
                                                checked={id ? draft.has(id) : false}
                                                onChange={(v) => toggle(module, action, v)}
                                                disabled={!id || setPermissionsMutation.isPending}
                                            />
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Stats + save */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-xs text-muted-foreground">
                    {draft.size} permission{draft.size !== 1 ? "s" : ""} selected
                    {isDirty && (
                        <span className="ml-2 text-orange-500 dark:text-orange-400 font-medium">
                            · Unsaved changes
                        </span>
                    )}
                </p>

                <Button
                    onClick={handleSave}
                    disabled={!isDirty || setPermissionsMutation.isPending}
                    size="sm"
                    className="gap-1.5"
                >
                    {setPermissionsMutation.isPending
                        ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
                        : <><Save className="w-4 h-4" />Save permissions</>
                    }
                </Button>
            </div>
        </div>
    );
}