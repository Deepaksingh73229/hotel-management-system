import { cn } from "@/lib/utils";

// Map action keywords → colour scheme
const resolveVariant = (action: string): string => {
    const a = action.toLowerCase();

    if (a.includes("create") || a.includes("register") || a.includes("seed"))
        return "bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400  border-green-200  dark:border-green-800";

    if (a.includes("update") || a.includes("edit") || a.includes("set") || a.includes("assign"))
        return "bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400   border-blue-200   dark:border-blue-800";

    if (
        a.includes("delete") || a.includes("deactivate") ||
        a.includes("cancel") || a.includes("void") ||
        a.includes("remove")
    )
        return "bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400    border-red-200    dark:border-red-800";

    if (a.includes("check_in") || a.includes("check_out"))
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800";

    if (a.includes("reset") || a.includes("password") || a.includes("change"))
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800";

    if (a.includes("no_show"))
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";

    return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700";
};

interface AuditActionBadgeProps {
    action: string;
    className?: string;
}

export function AuditActionBadge({ action, className }: AuditActionBadgeProps) {
    const label = action.replace(/_/g, " ");
    return (
        <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap",
            resolveVariant(action),
            className
        )}>
            {label}
        </span>
    );
}