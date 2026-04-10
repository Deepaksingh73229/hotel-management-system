import { cn } from "@/lib/utils";

type BadgeVariant = "green" | "red" | "blue" | "orange" | "purple" | "gray" | "yellow";

const VARIANT_STYLES: Record<BadgeVariant, string> = {
    green: "bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400",
    red: "bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400",
    blue: "bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    gray: "bg-gray-100   text-gray-600   dark:bg-gray-800      dark:text-gray-400",
    yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

interface StatusBadgeProps {
    label: string;
    variant: BadgeVariant;
    dot?: boolean;        // pulsing dot — use for "live" statuses like checked_in
    className?: string;
}

export function StatusBadge({ label, variant, dot = false, className }: StatusBadgeProps) {
    return (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
            VARIANT_STYLES[variant],
            className
        )}>
            {dot && (
                <span className="relative flex h-1.5 w-1.5">
                    <span className={cn(
                        "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                        variant === "green" ? "bg-green-500" : "bg-current"
                    )} />
                    <span className={cn(
                        "relative inline-flex rounded-full h-1.5 w-1.5",
                        variant === "green" ? "bg-green-500" : "bg-current"
                    )} />
                </span>
            )}
            {label}
        </span>
    );
}