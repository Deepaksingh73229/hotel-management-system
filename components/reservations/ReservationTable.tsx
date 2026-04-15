"use client";

import { format } from "date-fns";
import { Copy, Check, CalendarDays } from "lucide-react";
import { useState, useCallback } from "react";

import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { ReservationStatusBadge } from "./ReservationStatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { guestFullName } from "@/types";
import type { Reservation, ReservationStatus } from "@/types";

// ─── Copy-to-clipboard confirmation number ────────────────────────────────────
function ConfirmationNumber({ value }: { value: string }) {
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
                aria-label="Copy confirmation number"
            >
                {copied
                    ? <Check className="w-3 h-3 text-green-500" />
                    : <Copy className="w-3 h-3" />
                }
            </button>
        </div>
    );
}

interface ReservationTableProps {
    reservations: Reservation[];
    isLoading: boolean;
    page: number;
    totalPages: number;
    total: number;
    limit: number;
    onPageChange: (p: number) => void;
    onRowClick: (r: Reservation) => void;
}

export function ReservationTable({
    reservations,
    isLoading,
    page,
    totalPages,
    total,
    limit,
    onPageChange,
    onRowClick,
}: ReservationTableProps) {
    return (
        <div className="space-y-4">
            <div className="border border-border rounded-xl overflow-hidden bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[160px]">Confirmation #</TableHead>
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
                        {isLoading && Array.from({ length: 8 }).map((_, i) => (
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
                                    <ConfirmationNumber value={res.confirmationNumber} />
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
                                    {res.room && (
                                        <span className="ml-1 text-xs font-medium text-foreground">
                                            · {res.room.roomNumber}
                                        </span>
                                    )}
                                </TableCell>

                                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                    {format(new Date(res.checkInDate), "dd MMM yyyy")}
                                </TableCell>

                                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                                    {format(new Date(res.checkOutDate), "dd MMM yyyy")}
                                </TableCell>

                                <TableCell className="text-sm text-right">
                                    {res.nights}
                                </TableCell>

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
            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <p>
                        Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm"
                            disabled={page === 1}
                            onClick={() => onPageChange(page - 1)}>
                            Previous
                        </Button>
                        <Button variant="outline" size="sm"
                            disabled={page === totalPages}
                            onClick={() => onPageChange(page + 1)}>
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}