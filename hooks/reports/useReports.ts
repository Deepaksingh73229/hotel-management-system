"use client";

import { useQuery } from "@tanstack/react-query";
import * as reportService from "@/services/report.service";
import type { DateRangeParams } from "@/types";

export const reportKeys = {
    occupancy:           (p: DateRangeParams)  => ["reports", "occupancy",  p] as const,
    revenue:             (p: DateRangeParams)  => ["reports", "revenue",    p] as const,
    arrivalsDepartures:  (date: string)        => ["reports", "arrivals",   date] as const,
    nightAudit:          (page: number)        => ["reports", "nightAudit", page] as const,
};

export function useOccupancyReport(params: DateRangeParams, enabled = true) {
    return useQuery({
        queryKey: reportKeys.occupancy(params),
        queryFn:  () => reportService.getOccupancyReport(params),
        select:   (res) => res.data,
        enabled:  enabled && !!params.from && !!params.to,
        staleTime: 1000 * 60 * 5,   // reports stale after 5 min
    });
}

export function useRevenueReport(params: DateRangeParams, enabled = true) {
    return useQuery({
        queryKey: reportKeys.revenue(params),
        queryFn:  () => reportService.getRevenueReport(params),
        select:   (res) => res.data,
        enabled:  enabled && !!params.from && !!params.to,
        staleTime: 1000 * 60 * 5,
    });
}

export function useArrivalsDepartures(date: string) {
    return useQuery({
        queryKey: reportKeys.arrivalsDepartures(date),
        queryFn:  () => reportService.getArrivalsDepartures({ date }),
        select:   (res) => res.data,
        enabled:  !!date,
        staleTime: 1000 * 60 * 2,
    });
}

export function useNightAuditList(page = 1) {
    return useQuery({
        queryKey: reportKeys.nightAudit(page),
        queryFn:  () => reportService.getNightAuditList({ page, limit: 30 }),
        select:   (res) => res.data,
        staleTime: 1000 * 60 * 5,
    });
}