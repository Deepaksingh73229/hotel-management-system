import { cn } from "@/lib/utils";
import type { RoleName } from "@/types";

const STYLES: Record<RoleName, string> = {
    admin:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
    front_desk:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800",
};

const LABELS: Record<RoleName, string> = {
    admin:      "Admin",
    front_desk: "Front Desk",
};

interface RoleBadgeProps {
    role:       RoleName;
    className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
    return (
        <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
            STYLES[role] ?? STYLES.front_desk,
            className
        )}>
            {LABELS[role] ?? role}
        </span>
    );
}