"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Search, FileText } from "lucide-react";

import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input }    from "@/components/ui/input";
import { Button }   from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState }  from "@/components/common/EmptyState";
import { useFolios }   from "@/hooks/billing/useBilling";
import { guestFullName } from "@/types";
import type { FolioStatus } from "@/types";

const FOLIO_STATUS_VARIANT: Record<FolioStatus, "green" | "gray" | "red"> = {
    open:     "green",
    settled:  "gray",
    void:     "red",
};

const LIMIT = 20;

export function FolioTable() {
    const router = useRouter();
    const [search, setSearch]     = useState("");
    const [status, setStatus]     = useState<FolioStatus | "all">("all");
    const [page,   setPage]       = useState(1);

    const { data, isLoading } = useFolios({
        search: search || undefined,
        status: status === "all" ? undefined : status,
        page,
        limit:  LIMIT,
    });

    const folios     = data?.folios     ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="Search folio # or guest…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="pl-8 h-9 text-sm"
                    />
                </div>
                <Select
                    value={status}
                    onValueChange={(v) => { setStatus(v as FolioStatus | "all"); setPage(1); }}
                >
                    <SelectTrigger className="w-36 h-9 text-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All folios</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="settled">Settled</SelectItem>
                        <SelectItem value="void">Void</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Folio #</TableHead>
                            <TableHead>Guest</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Charges</TableHead>
                            <TableHead className="text-right">Payments</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                            <TableHead>Created</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && Array.from({ length: 6 }).map((_, i) => (
                            <TableRow key={i}>
                                {Array.from({ length: 7 }).map((_, j) => (
                                    <TableCell key={j}>
                                        <Skeleton className="h-4 w-full rounded" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}

                        {!isLoading && folios.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7}>
                                    <EmptyState
                                        icon={FileText}
                                        title="No folios found"
                                        description="Folios are created automatically when a reservation is checked in."
                                    />
                                </TableCell>
                            </TableRow>
                        )}

                        {!isLoading && folios.map((folio) => {
                            const balance  = folio.balance;
                            const isDebit  = balance > 0;

                            return (
                                <TableRow
                                    key={folio._id}
                                    className="cursor-pointer"
                                    onClick={() => router.push(`/billing/${folio._id}`)}
                                >
                                    <TableCell className="font-mono text-xs font-semibold">
                                        {folio.folioNumber}
                                    </TableCell>
                                    <TableCell className="text-sm font-medium">
                                        {guestFullName(folio.guest)}
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge
                                            label={folio.status.charAt(0).toUpperCase() + folio.status.slice(1)}
                                            variant={FOLIO_STATUS_VARIANT[folio.status]}
                                            dot={folio.status === "open"}
                                        />
                                    </TableCell>
                                    <TableCell className="text-sm text-right">
                                        ₹{(folio.totalCharges + folio.totalTax).toLocaleString("en-IN")}
                                    </TableCell>
                                    <TableCell className="text-sm text-right text-green-700 dark:text-green-400">
                                        ₹{folio.totalPayments.toLocaleString("en-IN")}
                                    </TableCell>
                                    <TableCell className={`text-sm font-semibold text-right ${
                                        isDebit
                                            ? "text-red-600 dark:text-red-400"
                                            : "text-green-600 dark:text-green-400"
                                    }`}>
                                        {isDebit ? "" : "+"} ₹{Math.abs(balance).toLocaleString("en-IN")}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {format(new Date(folio.createdAt), "dd MMM yyyy")}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
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
                        <Button variant="outline" size="sm" disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}>Previous</Button>
                        <Button variant="outline" size="sm" disabled={page === pagination.pages}
                            onClick={() => setPage((p) => p + 1)}>Next</Button>
                    </div>
                </div>
            )}
        </div>
    );
}