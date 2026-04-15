"use client";

import { format, parseISO } from "date-fns";
import { TrendingUp, BedDouble, CalendarCheck, CalendarX } from "lucide-react";
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { OccupancyReportData } from "@/types";

// ─── KPI card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, sub, color }: {
    icon:   React.ElementType;
    label:  string;
    value:  string;
    sub?:   string;
    color:  string;
}) => (
    <div className="bg-card border border-border rounded-xl p-4 space-y-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-4 h-4" />
        </div>
        <div>
            <p className="text-xl font-bold text-foreground leading-tight">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
            {sub && <p className="text-xs text-muted-foreground/70 mt-0.5">{sub}</p>}
        </div>
    </div>
);

interface OccupancyReportProps {
    data:      OccupancyReportData | undefined;
    isLoading: boolean;
}

export function OccupancyReport({ data, isLoading }: OccupancyReportProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                    ))}
                </div>
                <Skeleton className="h-64 rounded-xl" />
            </div>
        );
    }

    if (!data) return null;

    const { summary, daily } = data;

    return (
        <div className="space-y-5">
            {/* KPI strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KpiCard
                    icon={TrendingUp}
                    label="Avg occupancy"
                    value={`${summary.averageOccupancyPct.toFixed(1)}%`}
                    sub={`Peak: ${summary.peakOccupancyPct.toFixed(1)}%`}
                    color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                />
                <KpiCard
                    icon={BedDouble}
                    label="Total room nights"
                    value={summary.totalRoomNights.toLocaleString("en-IN")}
                    color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                />
                <KpiCard
                    icon={CalendarCheck}
                    label="Total arrivals"
                    value={summary.totalArrivals.toLocaleString("en-IN")}
                    color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                />
                <KpiCard
                    icon={CalendarX}
                    label="Total departures"
                    value={summary.totalDepartures.toLocaleString("en-IN")}
                    color="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                />
            </div>

            {/* Daily table */}
            <div className="border border-border rounded-xl overflow-hidden bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Occupied</TableHead>
                            <TableHead className="text-right">Available</TableHead>
                            <TableHead className="text-right">Arrivals</TableHead>
                            <TableHead className="text-right">Departures</TableHead>
                            <TableHead className="w-48">Occupancy</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {daily.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                                    No data for this period.
                                </TableCell>
                            </TableRow>
                        )}
                        {daily.map((day) => (
                            <TableRow key={day.date}>
                                <TableCell className="text-sm">
                                    {format(parseISO(day.date), "dd MMM yyyy")}
                                </TableCell>
                                <TableCell className="text-sm text-right font-medium">
                                    {day.occupied}
                                </TableCell>
                                <TableCell className="text-sm text-right text-muted-foreground">
                                    {day.available}
                                </TableCell>
                                <TableCell className="text-sm text-right text-green-700 dark:text-green-400">
                                    {day.arrivals}
                                </TableCell>
                                <TableCell className="text-sm text-right text-orange-600 dark:text-orange-400">
                                    {day.departures}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all"
                                                style={{ width: `${Math.min(day.occupancyPct, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-medium text-foreground w-10 text-right">
                                            {day.occupancyPct.toFixed(0)}%
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}