"use client";

import { useState } from "react";
import { UserPlus, ShieldOff } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { StaffTable } from "@/components/staff/StaffTable";
import { InviteStaffDrawer } from "@/components/staff/InviteStaffDrawer";
import { EditStaffDrawer } from "@/components/staff/EditStaffDrawer";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/hooks/auth/usePermission";
import { useRoles } from "@/hooks/staff/useStaff";
import type { StaffUser } from "@/services/user.service";

export default function StaffPage() {
    const { isAdmin } = usePermission();
    const { data: roles = [], isLoading: rolesLoading } = useRoles();

    const [inviteOpen, setInviteOpen] = useState(false);
    const [editUser, setEditUser] = useState<StaffUser | null>(null);

    // Hard client-side guard — the sidebar already hides this for non-admins
    // but we defend in depth here too.
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
                        disabled={rolesLoading || roles.length === 0}
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