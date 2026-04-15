"use client";

import { format, parseISO } from "date-fns";
import { CheckCircle2, XCircle } from "lucide-react";
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button }   from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { NightAuditListData } from "@/types";

interface NightAuditReportProps {
    data:        NightAuditListData | undefined;
    isLoading:   boolean;
    page:        number;
    onPageChange:(p: number) => void;
}

export function NightAuditReport({ data, isLoading, page, onPageChange }: NightAuditReportProps) {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
            </div>
        );
    }

    const audits     = data?.audits     ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-4">
            <div className="border border-border rounded-xl overflow-hidden bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Business date</TableHead>
                            <TableHead>Run at</TableHead>
                            <TableHead>Run by</TableHead>
                            <TableHead className="text-right">Rooms occ.</TableHead>
                            <TableHead className="text-right">Occ %</TableHead>
                            <TableHead className="text-right">Room revenue</TableHead>
                            <TableHead className="text-right">Total revenue</TableHead>
                            <TableHead className="text-right">Charges posted</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {audits.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-10">
                                    No night audit records found.
                                </TableCell>
                            </TableRow>
                        )}
                        {audits.map((audit) => (
                            <TableRow key={audit._id}>
                                <TableCell className="text-sm font-medium">
                                    {format(parseISO(audit.businessDate), "dd MMM yyyy")}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {format(new Date(audit.runAt), "HH:mm")}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {audit.runBy?.name ?? "—"}
                                </TableCell>
                                <TableCell className="text-sm text-right">
                                    {audit.summary?.roomsOccupied ?? "—"}
                                </TableCell>
                                <TableCell className="text-sm text-right">
                                    {audit.summary?.occupancyPercent != null
                                        ? `${audit.summary.occupancyPercent.toFixed(1)}%`
                                        : "—"
                                    }
                                </TableCell>
                                <TableCell className="text-sm font-medium text-right">
                                    {audit.summary?.roomRevenue != null
                                        ? `₹${audit.summary.roomRevenue.toLocaleString("en-IN")}`
                                        : "—"
                                    }
                                </TableCell>
                                <TableCell className="text-sm font-medium text-right">
                                    {audit.summary?.totalRevenue != null
                                        ? `₹${audit.summary.totalRevenue.toLocaleString("en-IN")}`
                                        : "—"
                                    }
                                </TableCell>
                                <TableCell className="text-sm text-right text-muted-foreground">
                                    {audit.chargesPosted}
                                </TableCell>
                                <TableCell>
                                    {audit.status === "completed"
                                        ? <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        : <XCircle     className="w-4 h-4 text-red-500" />
                                    }
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <p>Page {page} of {pagination.pages}</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm"
                            disabled={page === 1}
                            onClick={() => onPageChange(page - 1)}>
                            Previous
                        </Button>
                        <Button variant="outline" size="sm"
                            disabled={page === pagination.pages}
                            onClick={() => onPageChange(page + 1)}>
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}