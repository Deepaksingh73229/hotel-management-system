"use client";

import { PanelLeftClose, PanelLeftOpen, Hotel } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { SidebarItem } from "./SidebarItem";
import { UserMenu } from "./UserMenu";
import { useSidebarStore } from "@/stores/sidebar.store";
import { useAuthStore } from "@/stores/auth.store";
import { NAV_ITEMS } from "@/config/navigation";
import { cn } from "@/lib/utils";
import type { RoleName } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────

export function Sidebar() {
    const { isCollapsed, toggle } = useSidebarStore();
    const user = useAuthStore((s) => s.user);

    const userRole = user?.role?.name as RoleName | undefined;

    // Filter nav items the current user can see.
    const visibleItems = NAV_ITEMS.filter((item) => {
        if (!item.roles) return true;              // visible to all
        if (!userRole) return false;             // not loaded yet
        return item.roles.includes(userRole);
    });

    return (
        <TooltipProvider>
            <aside
                className={cn(
                    // Layout
                    "flex flex-col h-screen border-r border-border bg-card",
                    "transition-all duration-200 ease-in-out flex-shrink-0",

                    // Width switches between collapsed (64px) and expanded (240px)
                    isCollapsed ? "w-16" : "w-60"
                )}
            >
                {/* ── Top: Logo + collapse toggle ─────────────────────── */}
                <div className={cn(
                    "flex items-center h-14 border-b border-border px-3 flex-shrink-0",
                    isCollapsed ? "justify-center" : "justify-between"
                )}>
                    {!isCollapsed && (
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                                <Hotel className="w-4 h-4 text-primary-foreground" />
                            </div>
                            <span className="font-semibold text-sm text-foreground truncate">
                                StayOS
                            </span>
                        </div>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggle}
                        className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-foreground"
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed
                            ? <PanelLeftOpen className="w-4 h-4" />
                            : <PanelLeftClose className="w-4 h-4" />
                        }
                    </Button>
                </div>

                {/* ── Middle: Navigation ──────────────────────────────── */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5">
                    {visibleItems.map((item, index) => {
                        // Render a group label before the first item in a new group.
                        const prevItem = visibleItems[index - 1];
                        const showGroup =
                            item.groupLabel &&
                            item.groupLabel !== prevItem?.groupLabel;

                        return (
                            <div key={item.href}>
                                {showGroup && !isCollapsed && (
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-3 pt-4 pb-1">
                                        {item.groupLabel}
                                    </p>
                                )}
                                {showGroup && isCollapsed && (
                                    <div className="my-2 mx-auto w-6 border-t border-border" />
                                )}
                                <SidebarItem
                                    label={item.label}
                                    href={item.href}
                                    icon={item.icon}
                                    isCollapsed={isCollapsed}
                                />
                            </div>
                        );
                    })}
                </nav>

                {/* ── Bottom: User menu ───────────────────────────────── */}
                <div className="flex-shrink-0 border-t border-border p-2">
                    <UserMenu collapsed={isCollapsed} />
                </div>
            </aside>
        </TooltipProvider>
    );
}