"use client";

import { useState } from "react";
import { MoreHorizontal, Search, UserX, Pencil } from "lucide-react";
import { format } from "date-fns";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleBadge } from "./RoleBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { useUsers } from "@/hooks/staff/useUsers";
import type { AuthUser, RoleName } from "@/types";

// ─── Initials helper ──────────────────────────────────────────────────────────
const initials = (name: string) =>
    name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

interface StaffTableProps {
    roles: { _id: string; name: string; displayName: string }[];
    onEdit: (user: AuthUser) => void;
}

export function StaffTable({ roles, onEdit }: StaffTableProps) {
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [page, setPage] = useState(1);
    const LIMIT = 20;

    const roleId = roleFilter === "all"
        ? undefined
        : roles.find((r) => r.name === roleFilter)?._id;

    const { data, isLoading } = useUsers({
        search: search || undefined,
        role: roleId,
        page,
        limit: LIMIT,
    });

    const users = data?.users ?? [];
    const pagination = data?.pagination;

    return (
        <div className="space-y-4">

            {/* ── Filters ────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="Search name or email…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="pl-8 h-9 text-sm"
                    />
                </div>
                <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-36 h-9 text-sm">
                        <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All roles</SelectItem>
                        {roles.map((r) => (
                            <SelectItem key={r._id} value={r.name}>{r.displayName}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* ── Table ──────────────────────────────────────────────── */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[280px]">Staff member</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last login</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="w-10" />
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {/* Loading skeleton */}
                        {isLoading && Array.from({ length: 6 }).map((_, i) => (
                            <TableRow key={i}>
                                {Array.from({ length: 6 }).map((_, j) => (
                                    <TableCell key={j}>
                                        <Skeleton className="h-4 w-full rounded" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}

                        {/* Empty state */}
                        {!isLoading && users.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6}>
                                    <EmptyState
                                        title="No staff found"
                                        description={
                                            search
                                                ? "Try a different search term."
                                                : "Invite your first staff member to get started."
                                        }
                                    />
                                </TableCell>
                            </TableRow>
                        )}

                        {/* Rows */}
                        {!isLoading && users.map((user) => (
                            <TableRow
                                key={user._id}
                                className="cursor-pointer"
                                onClick={() => onEdit(user)}
                            >
                                {/* Name + email */}
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                            {initials(user.name)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">
                                                {user.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Role */}
                                <TableCell>
                                    <RoleBadge role={user.role.name as RoleName} />
                                </TableCell>

                                {/* Status */}
                                <TableCell>
                                    <StatusBadge
                                        label={user.isActive ? "Active" : "Inactive"}
                                        variant={user.isActive ? "green" : "gray"}
                                    />
                                </TableCell>

                                {/* Last login */}
                                <TableCell className="text-sm text-muted-foreground">
                                    {user.lastLoginAt
                                        ? format(new Date(user.lastLoginAt), "dd MMM yyyy")
                                        : "Never"
                                    }
                                </TableCell>

                                {/* Created */}
                                <TableCell className="text-sm text-muted-foreground">
                                    {format(new Date(user.createdAt), "dd MMM yyyy")}
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
                                                onClick={() => onEdit(user)}
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

            {/* ── Pagination ─────────────────────────────────────────── */}
            {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <p>
                        Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, pagination.total)} of {pagination.total}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline" size="sm"
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline" size="sm"
                            disabled={page === pagination.pages}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}