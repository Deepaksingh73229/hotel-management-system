import client from "./api/client";
import type {
    ApiResponse,
    DateRangeParams,
    OccupancyReportData,
    RevenueReportData,
    ArrivalsDeparturesData,
    NightAuditListData,
} from "@/types";

/**
 * GET /api/reports/occupancy
 */
export const getOccupancyReport = async (params: DateRangeParams) => {
    const res = await client.get<ApiResponse<OccupancyReportData>>(
        "/reports/occupancy",
        { params }
    );
    return res.data;
};

/**
 * GET /api/reports/revenue
 */
export const getRevenueReport = async (params: DateRangeParams) => {
    const res = await client.get<ApiResponse<RevenueReportData>>(
        "/reports/revenue",
        { params }
    );
    return res.data;
};

/**
 * GET /api/reports/arrivals-departures
 * Returns today's arrivals, departures and in-house list for a given date.
 */
export const getArrivalsDepartures = async (params: { date: string }) => {
    const res = await client.get<ApiResponse<ArrivalsDeparturesData>>(
        "/reports/arrivals-departures",
        { params }
    );
    return res.data;
};

/**
 * GET /api/reports/night-audit
 */
export const getNightAuditList = async (params?: { page?: number; limit?: number }) => {
    const res = await client.get<ApiResponse<NightAuditListData>>(
        "/reports/night-audit",
        { params }
    );
    return res.data;
};