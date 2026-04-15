import Link from "next/link";
import { type LucideIcon, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportCardProps {
    title:       string;
    description: string;
    href:        string;
    icon:        LucideIcon;
    color:       string;    // tailwind bg + text classes
}

export function ReportCard({ title, description, href, icon: Icon, color }: ReportCardProps) {
    return (
        <Link
            href={href}
            className={cn(
                "group bg-card border border-border rounded-xl p-5 space-y-4",
                "hover:shadow-md hover:border-primary/30 transition-all duration-150",
                "flex flex-col"
            )}
        >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", color)}>
                <Icon className="w-5 h-5" />
            </div>

            <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {description}
                </p>
            </div>

            <div className="flex items-center text-xs text-primary font-medium gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                View report <ArrowRight className="w-3 h-3" />
            </div>
        </Link>
    );
}