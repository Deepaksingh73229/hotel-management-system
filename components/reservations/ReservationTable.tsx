"use client";

import { useState, useCallback } from "react";
import { format } from "date-fns";
import { Search, Copy, Check, CalendarDays } from "lucide-react";

import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { ReservationStatusBadge } from "./ReservationStatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { useReservations } from "@/hooks/reservations/useReservations";
import { guestFullName } from "@/types";
import {
    RESERVATION_STATUS_META,
    type ReservationStatus,
    type Reservation,
} from "@/types/reservation.types";

// ─── Copyable confirmation number ─────────────────────────────────────────────
function ConfNumber({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);

    const copy = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    }, [value]);

    return (
        <div className="flex items-center gap-1.5 group">
            <span className="font-mono text-xs font-semibold text-foreground tracking-wide">
                {value}
            </span>
            <button
                onClick={copy}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
            >
                {copied
                    ? <Check className="w-3 h-3 text-green-500" />
                    : <Copy className="w-3 h-3" />
                }
            </button>
        </div>
    );
}

const STATUS_OPTIONS = Object.entries(RESERVATION_STATUS_META) as [
    ReservationStatus,
    (typeof RESERVATION_STATUS_META)[ReservationStatus]
][];

const LIMIT = 20;

interface Props {
    onRowClick: (r: Reservation) => void;
}

export function ReservationTable({ onRowClick }: Props) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<ReservationStatus | "all">("all");
    const [page, setPage] = useState(1);

    const { data, isLoading } = useReservations({
        search: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        page,
        limit: LIMIT,
    });

    const reservations = data?.reservations ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48 max-w-sm">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="Search confirmation # or guest name…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="pl-8 h-9 text-sm"
                    />
                </div>

                {/* Status pills */}
                <div className="flex flex-wrap gap-1.5">
                    {[{ key: "all", label: "All" }, ...STATUS_OPTIONS.map(([k, v]) => ({ key: k, label: v.label }))].map(
                        ({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => { setStatusFilter(key as any); setPage(1); }}
                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${statusFilter === key
                                        ? "bg-foreground text-background border-foreground"
                                        : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                                    }`}
                            >
                                {label}
                            </button>
                        )
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-40">Confirmation #</TableHead>
                            <TableHead>Guest</TableHead>
                            <TableHead>Room type</TableHead>
                            <TableHead>Check-in</TableHead>
                            <TableHead>Check-out</TableHead>
                            <TableHead className="text-right">Nights</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {/* Skeleton */}
                        {isLoading && Array.from({ length: 6 }).map((_, i) => (
                            <TableRow key={i}>
                                {Array.from({ length: 8 }).map((_, j) => (
                                    <TableCell key={j}>
                                        <Skeleton className="h-4 w-full rounded" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}

                        {/* Empty */}
                        {!isLoading && reservations.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8}>
                                    <EmptyState
                                        icon={CalendarDays}
                                        title="No reservations found"
                                        description="Try adjusting your filters or create a new reservation."
                                    />
                                </TableCell>
                            </TableRow>
                        )}

                        {/* Rows */}
                        {!isLoading && reservations.map((res) => (
                            <TableRow
                                key={res._id}
                                className="cursor-pointer"
                                onClick={() => onRowClick(res)}
                            >
                                <TableCell>
                                    <ConfNumber value={res.confirmationNumber} />
                                </TableCell>
                                <TableCell>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">
                                            {guestFullName(res.primaryGuest)}
                                        </p>
                                        {res.primaryGuest.phone && (
                                            <p className="text-xs text-muted-foreground">
                                                {res.primaryGuest.phone}
                                            </p>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {res.roomType.name}
                                    {(res.room as any)?.roomNumber && (
                                        <span className="ml-1.5 font-medium text-foreground">
                                            · {(res.room as any).roomNumber}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                    {format(new Date(res.checkInDate), "dd MMM yyyy")}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                    {format(new Date(res.checkOutDate), "dd MMM yyyy")}
                                </TableCell>
                                <TableCell className="text-sm text-right">{res.nights}</TableCell>
                                <TableCell className="text-sm font-medium text-right whitespace-nowrap">
                                    ₹{res.totalAmount.toLocaleString("en-IN")}
                                </TableCell>
                                <TableCell>
                                    <ReservationStatusBadge status={res.status} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <p>
                        Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, pagination.total)} of {pagination.total}
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm"
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}>
                            Previous
                        </Button>
                        <Button variant="outline" size="sm"
                            disabled={page === pagination.pages}
                            onClick={() => setPage((p) => p + 1)}>
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}