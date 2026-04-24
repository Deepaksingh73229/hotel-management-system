"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Search, MoreHorizontal, Pencil, UserX } from "lucide-react";

import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { RoleBadge } from "./RoleBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useStaffList, useDeactivateStaff } from "@/hooks/staff/useStaff";
import { useAuthStore } from "@/stores/auth.store";
import type { Role, StaffUser } from "@/services/user.service";

// ─── Initials helper ──────────────────────────────────────────────────────────
const initials = (name: string) =>
    name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

const LIMIT = 20;

interface StaffTableProps {
    roles: Role[];
    onEdit: (user: StaffUser) => void;
}

export function StaffTable({ roles, onEdit }: StaffTableProps) {
    const currentUser = useAuthStore((s) => s.user);

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [deactivateTarget, setDeactivateTarget] = useState<StaffUser | null>(null);

    const deactivateMutation = useDeactivateStaff();

    // Build params matching what the controller accepts:
    // role = ObjectId, isActive = boolean string, search = text
    const roleId = roleFilter === "all"
        ? undefined
        : roles.find((r) => r.name === roleFilter)?._id;

    const isActiveParam =
        statusFilter === "all" ? undefined :
            statusFilter === "active" ? true : false;

    const { data, isLoading } = useStaffList({
        search: search || undefined,
        role: roleId,
        isActive: isActiveParam,
        page,
        limit: LIMIT,
    });

    const users = data?.users ?? [];
    const pagination = data?.pagination;

    const handleDeactivate = () => {
        if (!deactivateTarget) return;
        deactivateMutation.mutate(deactivateTarget._id, {
            onSuccess: () => setDeactivateTarget(null),
        });
    };

    return (
        <>
            <div className="space-y-4">
                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-48 max-w-sm">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Search name or email…"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="pl-8 h-9 text-sm"
                        />
                    </div>

                    {/* Role filter — uses role.name as value, resolves to ObjectId for API */}
                    <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
                        <SelectTrigger className="w-36 h-9 text-sm">
                            <SelectValue placeholder="All roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All roles</SelectItem>
                            {roles.map((r) => (
                                <SelectItem key={r._id} value={r.name}>
                                    {r.displayName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Status filter — maps to isActive boolean */}
                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                        <SelectTrigger className="w-32 h-9 text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
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
                            {/* Loading */}
                            {isLoading && Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 6 }).map((_, j) => (
                                        <TableCell key={j}>
                                            <Skeleton className="h-4 w-full rounded" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}

                            {/* Empty */}
                            {!isLoading && users.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <EmptyState
                                            title="No staff found"
                                            description={
                                                search
                                                    ? "Try a different search term."
                                                    : "Invite your first staff member."
                                            }
                                        />
                                    </TableCell>
                                </TableRow>
                            )}

                            {/* Rows */}
                            {!isLoading && users.map((user) => {
                                const isSelf = currentUser?._id === user._id;

                                return (
                                    <TableRow
                                        key={user._id}
                                        className="cursor-pointer"
                                        onClick={() => onEdit(user)}
                                    >
                                        {/* Avatar + name + email */}
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                                    {initials(user.name)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-medium text-foreground truncate">
                                                            {user.name}
                                                        </p>
                                                        {isSelf && (
                                                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                                                you
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Role */}
                                        <TableCell>
                                            <RoleBadge
                                                name={user.role.name}
                                                displayName={user.role.displayName}
                                            />
                                        </TableCell>

                                        {/* Active / Inactive */}
                                        <TableCell>
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${user.isActive
                                                    ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                                                    : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                                                }`}>
                                                {user.isActive ? (
                                                    <>
                                                        <span className="relative flex h-1.5 w-1.5">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                                                        </span>
                                                        Active
                                                    </>
                                                ) : "Inactive"}
                                            </span>
                                        </TableCell>

                                        {/* Last login */}
                                        <TableCell className="text-sm text-muted-foreground">
                                            {user.lastLoginAt
                                                ? format(new Date(user.lastLoginAt), "dd MMM yyyy")
                                                : "Never"
                                            }
                                        </TableCell>

                                        {/* Created at */}
                                        <TableCell className="text-sm text-muted-foreground">
                                            {format(new Date(user.createdAt), "dd MMM yyyy")}
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        className="h-7 w-7 text-muted-foreground"
                                                    >
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        className="gap-2 cursor-pointer"
                                                        onClick={() => onEdit(user)}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                        Edit account
                                                    </DropdownMenuItem>

                                                    {/* Deactivate — controller guards self-deactivation */}
                                                    {!isSelf && user.isActive && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                                                onClick={() => setDeactivateTarget(user)}
                                                            >
                                                                <UserX className="w-4 h-4" />
                                                                Deactivate
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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

            {/* Deactivate confirm dialog */}
            <ConfirmDialog
                open={!!deactivateTarget}
                onOpenChange={(open) => { if (!open) setDeactivateTarget(null); }}
                title="Deactivate account?"
                description={`${deactivateTarget?.name} will immediately lose access to StayOS. This can be reversed by editing their account.`}
                confirmLabel="Deactivate"
                variant="destructive"
                isPending={deactivateMutation.isPending}
                onConfirm={handleDeactivate}
            />
        </>
    );
}