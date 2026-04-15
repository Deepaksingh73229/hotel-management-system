"use client";

import { useState, useMemo } from "react";
import { CalendarCheck, CalendarX, BedDouble, CalendarPlus } from "lucide-react";
import { isToday, parseISO } from "date-fns";

import { PageHeader } from "@/components/common/PageHeader";
import { ReservationFilters } from "@/components/reservations/ReservationFilters";
import { ReservationTable } from "@/components/reservations/ReservationTable";
import { ReservationDrawer } from "@/components/reservations/ReservationDrawer";
import { NewReservationDrawer } from "@/components/reservations/NewReservationDrawer";
import { Button } from "@/components/ui/button";
import { useReservations } from "@/hooks/reservations/useReservations";
import type { Reservation, ReservationStatus } from "@/types";

const LIMIT = 20;

// ─── Today stat card ──────────────────────────────────────────────────────────
const TodayStat = ({ icon: Icon, label, value, color }: {
    icon: React.ElementType; label: string; value: number; color: string;
}) => (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-4 h-4" />
        </div>
        <div>
            <p className="text-xl font-semibold text-foreground leading-tight">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────

export default function ReservationsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<ReservationStatus | "all">("all");
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<Reservation | null>(null);
    const [newOpen, setNewOpen] = useState(false);

    const { data, isLoading } = useReservations({
        search: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        page,
        limit: LIMIT,
    });

    // Also fetch today's arrivals + departures for the stat strip
    const { data: todayData } = useReservations({ limit: 500 });
    const allReservations = todayData?.reservations ?? [];

    const stats = useMemo(() => ({
        arrivalsToday: allReservations.filter(
            (r) => isToday(parseISO(r.checkInDate)) && r.status === "confirmed"
        ).length,
        departureToday: allReservations.filter(
            (r) => isToday(parseISO(r.checkOutDate)) && r.status === "checked_in"
        ).length,
        inHouse: allReservations.filter((r) => r.status === "checked_in").length,
    }), [allReservations]);

    const reservations = data?.reservations ?? [];
    const pagination = data?.pagination;

    return (
        <div className="p-6 space-y-6 max-w-7xl">

            <PageHeader
                title="Reservations"
                subtitle="Manage bookings, check-ins, and check-outs."
                action={
                    <Button onClick={() => setNewOpen(true)}>
                        <CalendarPlus className="w-4 h-4 mr-2" />
                        New reservation
                    </Button>
                }
            />

            {/* ── Today's stats ───────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <TodayStat
                    icon={CalendarCheck}
                    label="Arrivals today"
                    value={stats.arrivalsToday}
                    color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                />
                <TodayStat
                    icon={CalendarX}
                    label="Departures today"
                    value={stats.departureToday}
                    color="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                />
                <TodayStat
                    icon={BedDouble}
                    label="In-house guests"
                    value={stats.inHouse}
                    color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                />
            </div>

            {/* ── Filters ─────────────────────────────────────────── */}
            <ReservationFilters
                search={search}
                statusFilter={statusFilter}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                onStatusChange={(v) => { setStatusFilter(v); setPage(1); }}
            />

            {/* ── Table ───────────────────────────────────────────── */}
            <ReservationTable
                reservations={reservations}
                isLoading={isLoading}
                page={page}
                totalPages={pagination?.pages ?? 1}
                total={pagination?.total ?? 0}
                limit={LIMIT}
                onPageChange={setPage}
                onRowClick={setSelected}
            />

            {/* ── Detail drawer ────────────────────────────────────── */}
            <ReservationDrawer
                reservation={selected}
                open={!!selected}
                onOpenChange={(open) => { if (!open) setSelected(null); }}
            />

            {/* ── New reservation drawer ───────────────────────────── */}
            <NewReservationDrawer
                open={newOpen}
                onOpenChange={setNewOpen}
            />
        </div>
    );
}