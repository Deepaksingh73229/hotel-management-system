import { Star, Ban, Building2, RefreshCw, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GuestTag } from "@/types";

const TAG_CONFIG: Record<GuestTag, {
    label: string;
    icon: React.ElementType;
    styles: string;
}> = {
    vip: {
        label: "VIP",
        icon: Star,
        styles: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800",
    },
    blacklisted: {
        label: "Blacklisted",
        icon: Ban,
        styles: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800",
    },
    corporate: {
        label: "Corporate",
        icon: Building2,
        styles: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
    },
    repeat: {
        label: "Repeat",
        icon: RefreshCw,
        styles: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800",
    },
    loyalty: {
        label: "Loyalty",
        icon: Award,
        styles: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800",
    },
};

interface GuestTagBadgeProps {
    tag: GuestTag;
    className?: string;
}

export function GuestTagBadge({ tag, className }: GuestTagBadgeProps) {
    const config = TAG_CONFIG[tag];
    if (!config) return null;
    const Icon = config.icon;

    return (
        <span className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
            config.styles,
            className
        )}>
            <Icon className="w-3 h-3" />
            {config.label}
        </span>
    );
}