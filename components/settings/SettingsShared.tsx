import { cn } from "@/lib/utils";

// ─── Section card ─────────────────────────────────────────────────────────────
export function SettingsSection({
    title,
    description,
    children,
    className,
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("bg-card border border-border rounded-xl p-5 space-y-5", className)}>
            <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                {description && (
                    <p className="text-xs text-muted-foreground">{description}</p>
                )}
            </div>
            {children}
        </div>
    );
}

// ─── Field label ──────────────────────────────────────────────────────────────
export function FieldLabel({
    children,
    required,
}: {
    children: React.ReactNode;
    required?: boolean;
}) {
    return (
        <p className="text-xs font-medium text-muted-foreground mb-1.5">
            {children}
            {required && <span className="text-destructive ml-0.5">*</span>}
        </p>
    );
}

// ─── Field error ──────────────────────────────────────────────────────────────
export function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-xs text-destructive mt-1">{message}</p>;
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function SettingsDivider() {
    return <div className="border-t border-border" />;
}

// ─── Empty row ────────────────────────────────────────────────────────────────
export function EmptyRow({
    colSpan,
    message,
}: {
    colSpan: number;
    message: string;
}) {
    return (
        <tr>
            <td
                colSpan={colSpan}
                className="px-4 py-8 text-center text-sm text-muted-foreground"
            >
                {message}
            </td>
        </tr>
    );
}