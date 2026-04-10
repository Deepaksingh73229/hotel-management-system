"use client";

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Input } from "@/components/ui/input";
import { NAV_ITEMS } from "@/config/navigation";
import { cn } from "@/lib/utils";

// Derive a human-readable page title from the current pathname.
const getPageTitle = (pathname: string): string => {
    // Try to match against nav items first.
    const match = NAV_ITEMS.slice()
        .sort((a, b) => b.href.length - a.href.length) // longest match first
        .find((item) => pathname === item.href || pathname.startsWith(item.href + "/"));

    if (match) return match.label;

    // Fallback: capitalise the last path segment.
    const last = pathname.split("/").filter(Boolean).pop() ?? "Dashboard";
    return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ");
};

interface TopbarProps {
    className?: string;
}

export function Topbar({ className }: TopbarProps) {
    const pathname = usePathname();
    const title = getPageTitle(pathname);

    return (
        <header className={cn(
            "h-14 flex items-center gap-4 px-6 border-b border-border bg-card flex-shrink-0",
            className
        )}>
            {/* Page title */}
            <h1 className="text-sm font-semibold text-foreground flex-shrink-0">
                {title}
            </h1>

            {/* Search — grows to fill available space */}
            <div className="flex-1 max-w-xs relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <Input
                    placeholder="Search…"
                    className="pl-8 h-8 text-sm bg-background"
                />
            </div>

            {/* Right side controls */}
            <div className="ml-auto flex items-center gap-1">
                <ThemeToggle />
            </div>
        </header>
    );
}