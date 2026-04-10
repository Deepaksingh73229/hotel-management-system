"use client";

import { useState } from "react";
import { UserPlus, ShieldOff } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/common/PageHeader";
import { StaffTable } from "@/components/staff/StaffTable";
import { InviteStaffDrawer } from "@/components/staff/InviteStaffDrawer";
import { EditStaffDrawer } from "@/components/staff/EditStaffDrawer";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/hooks/auth/usePermission";
import client from "@/services/api/client";
import type { AuthUser } from "@/types";

// ─── Fetch roles from the backend ─────────────────────────────────────────────
// We need real ObjectIds to pass to the create/edit forms.
const useRoles = () =>
    useQuery({
        queryKey: ["roles"],
        queryFn: async () => {
            const res = await client.get<{
                success: boolean;
                data: { roles: { _id: string; name: string; displayName: string; isActive: boolean }[] };
            }>("/roles");
            return res.data.data.roles.filter((r) => r.isActive);
        },
        staleTime: Infinity,   // roles never change at runtime
    });

// ─────────────────────────────────────────────────────────────────────────────

export default function StaffPage() {
    const { isAdmin } = usePermission();

    const [inviteOpen, setInviteOpen] = useState(false);
    const [editUser, setEditUser] = useState<AuthUser | null>(null);

    const { data: roles = [], isLoading: rolesLoading } = useRoles();

    // Hard guard — this route is admin-only but we double-check client-side.
    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-32 gap-3 text-center">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <ShieldOff className="w-5 h-5 text-destructive" />
                </div>
                <p className="text-sm font-medium">Access restricted</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                    You don't have permission to manage staff accounts.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-6xl">

            <PageHeader
                title="Staff"
                subtitle="Manage staff accounts, roles, and access."
                action={
                    <Button
                        onClick={() => setInviteOpen(true)}
                        disabled={rolesLoading}
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite staff
                    </Button>
                }
            />

            <StaffTable
                roles={roles}
                onEdit={(user) => setEditUser(user)}
            />

            <InviteStaffDrawer
                open={inviteOpen}
                onOpenChange={setInviteOpen}
                roles={roles}
            />

            <EditStaffDrawer
                user={editUser}
                open={!!editUser}
                onOpenChange={(open) => { if (!open) setEditUser(null); }}
                roles={roles}
            />
        </div>
    );
}