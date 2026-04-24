"use client";

import { CalendarCheck, CalendarX, BedDouble } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useArrivals, useDepartures, useInHouseGuests } from "@/hooks/reservations/useReservations";

const StatCard = ({ icon: Icon, label, value, color, isLoading }: {
    icon: React.ElementType;
    label: string;
    value: number;
    color: string;
    isLoading: boolean;
}) => (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
        <div className={`p-2.5 rounded-lg flex-shrink-0 ${color}`}>
            <Icon className="w-4 h-4" />
        </div>
        <div>
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
            {isLoading
                ? <Skeleton className="h-7 w-10 mt-1 rounded" />
                : <p className="text-2xl font-semibold text-foreground leading-tight">{value}</p>
            }
        </div>
    </div>
);

export function ReservationStatStrip() {
    const { data: arrivals, isLoading: a } = useArrivals();
    const { data: departures, isLoading: d } = useDepartures();
    const { data: inHouse, isLoading: h } = useInHouseGuests();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
                icon={CalendarCheck}
                label="Arrivals today"
                value={arrivals?.count ?? 0}
                color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                isLoading={a}
            />
            <StatCard
                icon={CalendarX}
                label="Departures today"
                value={departures?.count ?? 0}
                color="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                isLoading={d}
            />
            <StatCard
                icon={BedDouble}
                label="In-house guests"
                value={inHouse?.count ?? 0}
                color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                isLoading={h}
            />
        </div>
    );
}