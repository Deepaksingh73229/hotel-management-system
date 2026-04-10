import { BedDouble, CalendarCheck, CalendarX, DollarSign } from "lucide-react";

// ─── KPI card data (will come from API in Phase 3) ────────────────────────────
const KPI_CARDS = [
    {
        label:  "Rooms Occupied",
        value:  "—",
        icon:   BedDouble,
        color:  "text-blue-600 dark:text-blue-400",
        bg:     "bg-blue-50 dark:bg-blue-900/20",
    },
    {
        label:  "Check-ins Today",
        value:  "—",
        icon:   CalendarCheck,
        color:  "text-green-600 dark:text-green-400",
        bg:     "bg-green-50 dark:bg-green-900/20",
    },
    {
        label:  "Check-outs Today",
        value:  "—",
        icon:   CalendarX,
        color:  "text-orange-600 dark:text-orange-400",
        bg:     "bg-orange-50 dark:bg-orange-900/20",
    },
    {
        label:  "Revenue Today",
        value:  "—",
        icon:   DollarSign,
        color:  "text-purple-600 dark:text-purple-400",
        bg:     "bg-purple-50 dark:bg-purple-900/20",
    },
];

export default function DashboardPage() {
    return (
        <div className="p-6 space-y-6">

            {/* KPI strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {KPI_CARDS.map((card) => (
                    <div
                        key={card.label}
                        className="bg-card border border-border rounded-xl p-5 flex items-center gap-4"
                    >
                        <div className={`${card.bg} p-2.5 rounded-lg flex-shrink-0`}>
                            <card.icon className={`w-5 h-5 ${card.color}`} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
                            <p className="text-2xl font-semibold text-foreground mt-0.5">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Placeholder content area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 min-h-64 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Room occupancy grid coming in Phase 3</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-5 min-h-64 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Quick actions coming in Phase 3</p>
                </div>
            </div>
        </div>
    );
}