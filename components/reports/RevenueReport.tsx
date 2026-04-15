"use client";

import { format, parseISO } from "date-fns";
import { IndianRupee, TrendingUp, CreditCard, AlertCircle } from "lucide-react";
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { RevenueReportData } from "@/types";

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

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

interface RevenueReportProps {
    data:      RevenueReportData | undefined;
    isLoading: boolean;
}

export function RevenueReport({ data, isLoading }: RevenueReportProps) {
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

    const { summary, daily, bySource } = data;
    const maxRevenue = Math.max(...daily.map((d) => d.totalRevenue), 1);

    return (
        <div className="space-y-6">
            {/* KPI strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KpiCard
                    icon={IndianRupee}
                    label="Total revenue"
                    value={inr(summary.totalRevenue)}
                    color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                />
                <KpiCard
                    icon={TrendingUp}
                    label="ADR"
                    value={inr(Math.round(summary.averageDailyRate))}
                    sub="Average daily rate"
                    color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                />
                <KpiCard
                    icon={CreditCard}
                    label="Collections"
                    value={inr(summary.totalCollections)}
                    color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                />
                <KpiCard
                    icon={AlertCircle}
                    label="Outstanding"
                    value={inr(summary.totalOutstanding)}
                    color="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Daily revenue table */}
                <div className="lg:col-span-2 border border-border rounded-xl overflow-hidden bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Room revenue</TableHead>
                                <TableHead className="text-right">Other</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="w-32">Bar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {daily.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                                        No data for this period.
                                    </TableCell>
                                </TableRow>
                            )}
                            {daily.map((day) => (
                                <TableRow key={day.date}>
                                    <TableCell className="text-sm">
                                        {format(parseISO(day.date), "dd MMM")}
                                    </TableCell>
                                    <TableCell className="text-sm text-right">
                                        {inr(day.roomRevenue)}
                                    </TableCell>
                                    <TableCell className="text-sm text-right text-muted-foreground">
                                        {inr(day.otherRevenue)}
                                    </TableCell>
                                    <TableCell className="text-sm font-semibold text-right">
                                        {inr(day.totalRevenue)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="bg-muted rounded-full h-2 overflow-hidden">
                                            <div
                                                className="h-full bg-green-500 dark:bg-green-400 rounded-full"
                                                style={{
                                                    width: `${(day.totalRevenue / maxRevenue) * 100}%`
                                                }}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Revenue by source */}
                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                    <h4 className="text-sm font-semibold text-foreground">By source</h4>
                    {bySource.length === 0 && (
                        <p className="text-sm text-muted-foreground">No data.</p>
                    )}
                    {bySource.map((s) => {
                        const maxAmt = Math.max(...bySource.map((x) => x.amount), 1);
                        const pct    = Math.round((s.amount / maxAmt) * 100);
                        return (
                            <div key={s.source} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground capitalize">
                                        {s.source.replace(/_/g, " ")}
                                    </span>
                                    <span className="font-medium text-foreground">
                                        {inr(s.amount)} · {s.count}
                                    </span>
                                </div>
                                <div className="bg-muted rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}