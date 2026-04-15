"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { GuestTable } from "@/components/guests/GuestTable";
import { GuestDrawer } from "@/components/guests/GuestDrawer";
import { Button } from "@/components/ui/button";
import type { Guest } from "@/types";

export default function GuestsPage() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editGuest, setEditGuest] = useState<Guest | null>(null);

    const handleEdit = (guest: Guest) => {
        setEditGuest(guest);
        setDrawerOpen(true);
    };

    const handleClose = (open: boolean) => {
        setDrawerOpen(open);
        if (!open) setEditGuest(null);
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl">
            <PageHeader
                title="Guests"
                subtitle="Manage guest profiles, preferences, and history."
                action={
                    <Button onClick={() => { setEditGuest(null); setDrawerOpen(true); }}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add guest
                    </Button>
                }
            />

            <GuestTable onEdit={handleEdit} />

            <GuestDrawer
                open={drawerOpen}
                onOpenChange={handleClose}
                guest={editGuest}
            />
        </div>
    );
}