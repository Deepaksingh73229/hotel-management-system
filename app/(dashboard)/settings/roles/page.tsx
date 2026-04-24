"use client";

import { Loader2, RefreshCw, Info, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { RoleCard } from "@/components/roles/RoleCard";
import { usePermission } from "@/hooks/auth/usePermission";
import {
    useRoles,
    usePermissions,
    useSeedPermissions,
} from "@/hooks/roles/useRoles";

export default function RolesPage() {
    const { isAdmin } = usePermission();

    const { data: roles = [], isLoading: rolesLoading } = useRoles();
    const { data: permissions = [], isLoading: permsLoading } = usePermissions();
    const seedMutation = useSeedPermissions();

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-32 gap-3 text-center">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <ShieldOff className="w-5 h-5 text-destructive" />
                </div>
                <p className="text-sm font-medium">Access restricted</p>
                <p className="text-sm text-muted-foreground">Admin only.</p>
            </div>
        );
    }

    const isLoading = rolesLoading || permsLoading;

    return (
        <div className="p-6 space-y-6 max-w-5xl">
            <PageHeader
                title="Roles & permissions"
                subtitle="Control what each role can do across every module."
                action={
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => seedMutation.mutate()}
                        disabled={seedMutation.isPending}
                        className="gap-1.5"
                    >
                        {seedMutation.isPending
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <RefreshCw className="w-4 h-4" />
                        }
                        Seed permissions
                    </Button>
                }
            />

            {/* Info banner */}
            <div className="flex items-start gap-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/40 px-4 py-3">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                    <p className="font-medium">How this works</p>
                    <ul className="space-y-0.5 text-blue-600 dark:text-blue-400 list-disc list-inside">
                        <li>Click a <strong>row label</strong> to toggle all actions for that module.</li>
                        <li>Click a <strong>column header</strong> to toggle that action across all modules.</li>
                        <li>Click <strong>Save permissions</strong> to apply your changes.</li>
                        <li>Changes take effect on the user's next request after their token refreshes.</li>
                    </ul>
                </div>
            </div>

            {/* Seed prompt — shown if no permissions exist yet */}
            {!isLoading && permissions.length === 0 && (
                <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center space-y-3">
                    <p className="text-sm font-medium text-foreground">
                        No permissions found
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Click <strong>Seed permissions</strong> above to generate all module × action
                        combinations. This only needs to be done once.
                    </p>
                    <Button
                        onClick={() => seedMutation.mutate()}
                        disabled={seedMutation.isPending}
                        className="gap-1.5"
                    >
                        {seedMutation.isPending
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <RefreshCw className="w-4 h-4" />
                        }
                        Seed now
                    </Button>
                </div>
            )}

            {/* Loading */}
            {isLoading && (
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-xl" />
                    ))}
                </div>
            )}

            {/* Role cards */}
            {!isLoading && permissions.length > 0 && (
                <div className="space-y-4">
                    {roles.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No roles found.
                        </p>
                    )}
                    {roles.map((role) => (
                        <RoleCard key={role._id} role={role} />
                    ))}
                </div>
            )}
        </div>
    );
}