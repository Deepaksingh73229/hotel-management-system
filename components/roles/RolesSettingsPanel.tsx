"use client";

import { Loader2, RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleCard } from "./RoleCard";
import {
    useRoles,
    usePermissions,
    useSeedPermissions,
} from "@/hooks/roles/useRoles";

export function RolesSettingsPanel() {
    const { data: roles = [], isLoading: rolesLoading } = useRoles();
    const { data: permissions = [], isLoading: permsLoading } = usePermissions();
    const seedMutation = useSeedPermissions();

    const isLoading = rolesLoading || permsLoading;

    return (
        <div className="space-y-5">
            {/* Header row */}
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-foreground">Roles & permissions</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Control what each role can do across every module.
                    </p>
                </div>
                <Button
                    variant="outline" size="sm"
                    onClick={() => seedMutation.mutate()}
                    disabled={seedMutation.isPending}
                    className="gap-1.5 flex-shrink-0"
                >
                    {seedMutation.isPending
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <RefreshCw className="w-4 h-4" />
                    }
                    {permissions.length === 0 ? "Seed permissions" : "Re-seed"}
                </Button>
            </div>

            {/* Info hint */}
            <div className="flex items-start gap-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/40 px-4 py-3">
                <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                    Click a <strong>row label</strong> to toggle all actions for that module,
                    or a <strong>column header</strong> to toggle one action across all modules.
                    Hit <strong>Save permissions</strong> to apply.
                </p>
            </div>

            {/* Seed prompt */}
            {!isLoading && permissions.length === 0 && (
                <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center space-y-3">
                    <p className="text-sm font-medium">No permissions seeded yet</p>
                    <p className="text-xs text-muted-foreground">
                        Click <strong>Seed permissions</strong> to generate all module × action
                        combinations. Only needs to be done once.
                    </p>
                    <Button onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending} className="gap-1.5">
                        {seedMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Seed now
                    </Button>
                </div>
            )}

            {/* Loading */}
            {isLoading && (
                <div className="space-y-3">
                    {[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
                </div>
            )}

            {/* Role cards */}
            {!isLoading && permissions.length > 0 && (
                <div className="space-y-4">
                    {roles.map((role) => <RoleCard key={role._id} role={role} />)}
                </div>
            )}
        </div>
    );
}