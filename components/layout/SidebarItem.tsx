"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
    label: string;
    href: string;
    icon: LucideIcon;
    isCollapsed: boolean;
}

export function SidebarItem({ label, href, icon: Icon, isCollapsed }: SidebarItemProps) {
    const pathname = usePathname();

    // Active if the pathname matches exactly or is a sub-path.
    // e.g. /reservations/new is active when href is /reservations
    const isActive =
        pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

    const itemContent = (
        <Link
            href={href}
            className={cn(
                // Base
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                "transition-all duration-150",

                // Active state
                isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",

                // Collapsed: centre the icon
                isCollapsed && "justify-center px-2"
            )}
        >
            {/* Active bar */}
            {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
            )}

            <Icon className={cn(
                "flex-shrink-0 transition-colors",
                isCollapsed ? "w-5 h-5" : "w-4 h-4",
                isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
            )} />

            {!isCollapsed && (
                <span className="truncate">{label}</span>
            )}
        </Link>
    );

    // When collapsed, wrap with tooltip so the label still shows on hover.
    if (isCollapsed) {
        return (
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>{itemContent}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                    {label}
                </TooltipContent>
            </Tooltip>
        );
    }

    return itemContent;
}