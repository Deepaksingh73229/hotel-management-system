"use client";

import { LogOut, KeyRound, Monitor, ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/useAuth";
import { cn } from "@/lib/utils";

// ─── Role badge colours ───────────────────────────────────────────────────────
const ROLE_STYLES: Record<string, string> = {
    admin: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    front_desk: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

// ─── Initials from name ───────────────────────────────────────────────────────
const getInitials = (name: string) =>
    name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase();

interface UserMenuProps {
    /** When sidebar is collapsed, only show the avatar without text. */
    collapsed?: boolean;
}

export function UserMenu({ collapsed = false }: UserMenuProps) {
    const { user, logout, logoutAll, isLoggingOut } = useAuth();

    if (!user) return null;

    const initials = getInitials(user.name);
    const roleStyle = ROLE_STYLES[user.role.name] ?? ROLE_STYLES.front_desk;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full h-auto p-2 rounded-lg hover:bg-accent",
                        collapsed ? "justify-center" : "justify-start gap-2"
                    )}
                >
                    {/* Avatar circle */}
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                        {initials}
                    </div>

                    {!collapsed && (
                        <>
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium text-foreground truncate leading-tight">
                                    {user.name}
                                </p>
                                <span className={cn(
                                    "inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-0.5",
                                    roleStyle
                                )}>
                                    {user.role.displayName}
                                </span>
                            </div>
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                side="top"
                align={collapsed ? "center" : "start"}
                sideOffset={8}
                className="w-56"
            >
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="gap-2 cursor-pointer">
                    <KeyRound className="w-4 h-4" />
                    Change password
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    className="gap-2 cursor-pointer text-muted-foreground"
                    onClick={() => logoutAll()}
                >
                    <Monitor className="w-4 h-4" />
                    Sign out all devices
                </DropdownMenuItem>

                <DropdownMenuItem
                    className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                    onClick={() => logout()}
                    disabled={isLoggingOut}
                >
                    <LogOut className="w-4 h-4" />
                    {isLoggingOut ? "Signing out…" : "Sign out"}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}