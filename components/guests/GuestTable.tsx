"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MoreHorizontal, Pencil, User } from "lucide-react";
import { format } from "date-fns";

import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { GuestTagBadge } from "./GuestTagBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { useGuests } from "@/hooks/guests/useGuests";
import { guestFullName } from "@/types";
import type { Guest, GuestTag } from "@/types";

const TAG_OPTIONS: { value: GuestTag | "all"; label: string }[] = [
    { value: "all", label: "All guests" },
    { value: "vip", label: "VIP" },
    { value: "repeat", label: "Repeat" },
    { value: "corporate", label: "Corporate" },
    { value: "loyalty", label: "Loyalty" },
    { value: "blacklisted", label: "Blacklisted" },
];

const initials = (firstName: string, lastName: string) =>
    `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();

interface GuestTableProps {
    onEdit: (guest: Guest) => void;
}

export function GuestTable({ onEdit }: GuestTableProps) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [tagFilter, setTagFilter] = useState<GuestTag | "all">("all");
    const [page, setPage] = useState(1);
    const LIMIT = 20;

    const { data, isLoading } = useGuests({
        search: search || undefined,
        tag: tagFilter === "all" ? undefined : tagFilter,
        page,
        limit: LIMIT,
    });

    const guests = data?.guests ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-4">

            {/* ── Filters ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="Search name, email, or phone…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="pl-8 h-9 text-sm"
                    />
                </div>
                <Select
                    value={tagFilter}
                    onValueChange={(v) => { setTagFilter(v as GuestTag | "all"); setPage(1); }}
                >
                    <SelectTrigger className="w-40 h-9 text-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {TAG_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* ── Table ───────────────────────────────────────────── */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[260px]">Guest</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Tags</TableHead>
                            <TableHead>Stays</TableHead>
                            <TableHead>Total spend</TableHead>
                            <TableHead>Last stay</TableHead>
                            <TableHead className="w-10" />
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {/* Skeleton */}
                        {isLoading && Array.from({ length: 8 }).map((_, i) => (
                            <TableRow key={i}>
                                {Array.from({ length: 7 }).map((_, j) => (
                                    <TableCell key={j}>
                                        <Skeleton className="h-4 w-full rounded" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}

                        {/* Empty */}
                        {!isLoading && guests.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7}>
                                    <EmptyState
                                        icon={User}
                                        title="No guests found"
                                        description={
                                            search
                                                ? "Try a different search term or clear the filter."
                                                : "Add your first guest profile to get started."
                                        }
                                    />
                                </TableCell>
                            </TableRow>
                        )}

                        {/* Rows */}
                        {!isLoading && guests.map((guest) => (
                            <TableRow
                                key={guest._id}
                                className="cursor-pointer"
                                onClick={() => router.push(`/guests/${guest._id}`)}
                            >
                                {/* Name + email */}
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                            {initials(guest.firstName, guest.lastName)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">
                                                {guestFullName(guest)}
                                            </p>
                                            {guest.email && (
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {guest.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Contact */}
                                <TableCell className="text-sm text-muted-foreground">
                                    {guest.phone ?? "—"}
                                </TableCell>

                                {/* Tags */}
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {guest.tags?.length
                                            ? guest.tags.map((tag) => (
                                                <GuestTagBadge key={tag} tag={tag} />
                                            ))
                                            : <span className="text-xs text-muted-foreground">—</span>
                                        }
                                    </div>
                                </TableCell>

                                {/* Stays */}
                                <TableCell className="text-sm">
                                    {guest.totalStays}
                                </TableCell>

                                {/* Spend */}
                                <TableCell className="text-sm font-medium">
                                    {guest.totalSpend > 0
                                        ? `₹${guest.totalSpend.toLocaleString("en-IN")}`
                                        : "—"
                                    }
                                </TableCell>

                                {/* Last stay */}
                                <TableCell className="text-sm text-muted-foreground">
                                    {guest.lastStayAt
                                        ? format(new Date(guest.lastStayAt), "dd MMM yyyy")
                                        : "Never"
                                    }
                                </TableCell>

                                {/* Actions */}
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                className="gap-2"
                                                onClick={() => onEdit(guest)}
                                            >
                                                <Pencil className="w-4 h-4" /> Edit
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* ── Pagination ──────────────────────────────────────── */}
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