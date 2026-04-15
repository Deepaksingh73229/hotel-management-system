import { BarChart3, TrendingUp, CalendarDays, Moon } from "lucide-react";
import { PageHeader }  from "@/components/common/PageHeader";
import { ReportCard }  from "@/components/reports/ReportCard";

const REPORTS = [
    {
        title:       "Occupancy report",
        description: "Daily room occupancy percentages, arrivals, departures, and peak days over any date range.",
        href:        "/reports/occupancy",
        icon:        BarChart3,
        color:       "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    },
    {
        title:       "Revenue report",
        description: "Room revenue, other income, ADR, RevPAR, collections vs outstanding, broken down by source.",
        href:        "/reports/revenue",
        icon:        TrendingUp,
        color:       "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    },
    {
        title:       "Arrivals & departures",
        description: "View all arrivals, departures, and in-house guests for any single date.",
        href:        "/reports/arrivals-departures",
        icon:        CalendarDays,
        color:       "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    },
    {
        title:       "Night audit log",
        description: "Chronological record of every night audit run — occupancy, revenue, charges posted.",
        href:        "/reports/night-audit",
        icon:        Moon,
        color:       "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    },
];

export default function ReportsPage() {
    return (
        <div className="p-6 space-y-6 max-w-4xl">
            <PageHeader
                title="Reports"
                subtitle="Operational and financial reports for your property."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {REPORTS.map((r) => (
                    <ReportCard key={r.href} {...r} />
                ))}
            </div>
        </div>
    );
}