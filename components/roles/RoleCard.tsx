"use client";

import { useState } from "react";
import { Loader2, Pencil, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { PermissionsMatrix } from "./PermissionsMatrix";
import { useUpdateRole } from "@/hooks/roles/useRoles";
import { cn } from "@/lib/utils";
import type { Role } from "@/services/role.service";

const ROLE_STYLES: Record<string, string> = {
    admin:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
    front_desk:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800",
};

interface RoleCardProps {
    role: Role;
}

export function RoleCard({ role }: RoleCardProps) {
    const [matrixOpen, setMatrixOpen] = useState(false);
    const [editingName, setEditingName] = useState(false);
    const [displayName, setDisplayName] = useState(role.displayName);
    const [isActive, setIsActive] = useState(role.isActive);

    const updateMutation = useUpdateRole(role._id);

    const handleSaveEdit = () => {
        updateMutation.mutate(
            { displayName: displayName.trim() || role.displayName, isActive },
            { onSuccess: () => setEditingName(false) }
        );
    };

    const permCount = role.permissions.length;

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Header row */}
            <div className="flex items-center gap-3 px-5 py-4">
                {/* Role badge */}
                <span className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0",
                    ROLE_STYLES[role.name] ?? ROLE_STYLES.front_desk
                )}>
                    {role.name}
                </span>

                {/* Display name — editable */}
                {editingName ? (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Input
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="h-8 text-sm flex-1"
                            autoFocus
                            onKeyDown={(e) => { if (e.key === "Enter") handleSaveEdit(); }}
                        />
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Switch
                                checked={isActive}
                                onCheckedChange={setIsActive}
                                className="scale-75"
                            />
                            Active
                        </div>
                        <Button size="sm" className="h-8 text-xs gap-1"
                            onClick={handleSaveEdit}
                            disabled={updateMutation.isPending}>
                            {updateMutation.isPending
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : "Save"
                            }
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 text-xs"
                            onClick={() => {
                                setDisplayName(role.displayName);
                                setIsActive(role.isActive);
                                setEditingName(false);
                            }}>
                            Cancel
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-foreground">
                                    {role.displayName}
                                </p>
                                {!role.isActive && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                        inactive
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {permCount} permission{permCount !== 1 ? "s" : ""} assigned
                            </p>
                        </div>
                        <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 text-muted-foreground flex-shrink-0"
                            onClick={() => setEditingName(true)}
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </Button>
                    </>
                )}

                {/* Expand/collapse matrix */}
                <Button
                    variant="outline" size="sm"
                    className="h-8 text-xs gap-1 flex-shrink-0"
                    onClick={() => setMatrixOpen((v) => !v)}
                >
                    {matrixOpen
                        ? <><ChevronDown className="w-3.5 h-3.5" />   Hide permissions</>
                        : <><ChevronRight className="w-3.5 h-3.5" />  Edit permissions</>
                    }
                </Button>
            </div>

            {/* Permissions matrix — collapsible */}
            {matrixOpen && (
                <div className="border-t border-border px-5 py-5">
                    <PermissionsMatrix role={role} />
                </div>
            )}
        </div>
    );
}