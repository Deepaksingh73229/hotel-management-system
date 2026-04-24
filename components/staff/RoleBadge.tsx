import { cn } from "@/lib/utils";

type RoleName = "admin" | "front_desk";

const STYLES: Record<RoleName, string> = {
    admin:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
    front_desk:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800",
};

interface RoleBadgeProps {
    name: string;
    displayName: string;
    className?: string;
}

export function RoleBadge({ name, displayName, className }: RoleBadgeProps) {
    const style = STYLES[name as RoleName] ?? STYLES.front_desk;
    return (
        <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
            style,
            className
        )}>
            {displayName}
        </span>
    );
}