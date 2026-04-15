"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ReservationStatusBadge } from "@/components/reservations/ReservationStatusBadge";
import type { ArrivalsDeparturesData, ArrivalDepartureEntry, ReservationStatus } from "@/types";

type Tab = "arrivals" | "departures" | "inHouse";

const TABS: { key: Tab; label: string }[] = [
    { key: "arrivals",   label: "Arrivals" },
    { key: "departures", label: "Departures" },
    { key: "inHouse",    label: "In-house" },
];

function EntryTable({ entries }: { entries: ArrivalDepartureEntry[] }) {
    if (entries.length === 0) {
        return (
            <p className="text-sm text-muted-foreground text-center py-10">
                No entries for this date.
            </p>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="hover:bg-transparent">
                    <TableHead>Confirmation #</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Room type</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead className="text-right">Nights</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {entries.map((e) => (
                    <TableRow key={e._id}>
                        <TableCell className="font-mono text-xs font-semibold">
                            {e.confirmationNumber}
                        </TableCell>
                        <TableCell className="text-sm font-medium">{e.guestName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{e.roomType}</TableCell>
                        <TableCell className="text-sm">{e.roomNumber ?? "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {format(parseISO(e.checkInDate), "dd MMM")}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {format(parseISO(e.checkOutDate), "dd MMM")}
                        </TableCell>
                        <TableCell className="text-sm text-right">{e.nights}</TableCell>
                        <TableCell>
                            <ReservationStatusBadge status={e.status as ReservationStatus} />
                        </TableCell>
                        <TableCell className="text-sm font-medium text-right">
                            ₹{e.totalAmount.toLocaleString("en-IN")}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

interface ArrivalsReportProps {
    data:      ArrivalsDeparturesData | undefined;
    isLoading: boolean;
}

export function ArrivalsReport({ data, isLoading }: ArrivalsReportProps) {
    const [activeTab, setActiveTab] = useState<Tab>("arrivals");

    if (isLoading) {
        return <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">Loading…</div>;
    }

    if (!data) return null;

    const counts: Record<Tab, number> = {
        arrivals:   data.summary.totalArrivals,
        departures: data.summary.totalDepartures,
        inHouse:    data.summary.totalInHouse,
    };

    const rows: Record<Tab, ArrivalDepartureEntry[]> = {
        arrivals:   data.arrivals,
        departures: data.departures,
        inHouse:    data.inHouse,
    };

    return (
        <div className="space-y-4">
            {/* Summary pills */}
            <div className="flex gap-3 flex-wrap">
                {TABS.map(({ key, label }) => (
                    <div
                        key={key}
                        className="bg-card border border-border rounded-lg px-4 py-2 text-center min-w-[100px]"
                    >
                        <p className="text-lg font-bold text-foreground">{counts[key]}</p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                ))}
            </div>

            {/* Tab nav */}
            <div className="flex gap-1 border-b border-border">
                {TABS.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={cn(
                            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                            activeTab === key
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {label}
                        <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                            {counts[key]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
                <EntryTable entries={rows[activeTab]} />
            </div>
        </div>
    );
}