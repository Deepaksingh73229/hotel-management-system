"use client";

import { useState } from "react";
import { CalendarPlus } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { ReservationStatStrip } from "@/components/reservations/ReservationStatStrip";
import { ReservationTable } from "@/components/reservations/ReservationTable";
import { NewReservationDialog } from "@/components/reservations/NewReservationDialog";
import { ReservationDetailDrawer } from "@/components/reservations/ReservationDetailDrawer";
import type { Reservation } from "@/types/reservation.types";

export default function ReservationsPage() {
    const [createOpen, setCreateOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleRowClick = (r: Reservation) => {
        setSelectedId(r._id);
        setDrawerOpen(true);
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl">

            <PageHeader
                title="Reservations"
                subtitle="Manage bookings, check-ins, check-outs and more."
                action={
                    <Button onClick={() => setCreateOpen(true)} className="gap-2">
                        <CalendarPlus className="w-4 h-4" />
                        New reservation
                    </Button>
                }
            />

            {/* Today's stat strip */}
            <ReservationStatStrip />

            {/* List table */}
            <ReservationTable onRowClick={handleRowClick} />

            {/* Create dialog */}
            <NewReservationDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
            />

            {/* Detail drawer */}
            <ReservationDetailDrawer
                reservationId={selectedId}
                open={drawerOpen}
                onOpenChange={(open) => {
                    setDrawerOpen(open);
                    if (!open) setSelectedId(null);
                }}
            />
        </div>
    );
}