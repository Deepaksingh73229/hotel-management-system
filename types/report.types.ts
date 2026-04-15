// ─────────────────────────────────────────────────────────────────────────────
// SHARED PARAMS
// ─────────────────────────────────────────────────────────────────────────────

export interface DateRangeParams {
    from: string;   // ISO date "YYYY-MM-DD"
    to:   string;
}

// ─────────────────────────────────────────────────────────────────────────────
// OCCUPANCY REPORT
// ─────────────────────────────────────────────────────────────────────────────

export interface OccupancyDay {
    date:            string;
    occupied:        number;
    available:       number;
    occupancyPct:    number;
    arrivals:        number;
    departures:      number;
}

export interface OccupancySummary {
    averageOccupancyPct: number;
    totalRoomNights:     number;
    totalArrivals:       number;
    totalDepartures:     number;
    peakOccupancyDay:    string;
    peakOccupancyPct:    number;
}

export interface OccupancyReportData {
    summary: OccupancySummary;
    daily:   OccupancyDay[];
}

// ─────────────────────────────────────────────────────────────────────────────
// REVENUE REPORT
// ─────────────────────────────────────────────────────────────────────────────

export interface RevenueDay {
    date:         string;
    roomRevenue:  number;
    otherRevenue: number;
    totalRevenue: number;
    payments:     number;
}

export interface RevenueSummary {
    totalRoomRevenue:    number;
    totalOtherRevenue:   number;
    totalRevenue:        number;
    totalCollections:    number;
    totalOutstanding:    number;
    averageDailyRate:    number;    // ADR
    revenuePerRoom:      number;    // RevPAR
}

export interface RevenueBySource {
    source:  string;
    amount:  number;
    count:   number;
}

export interface RevenueReportData {
    summary:   RevenueSummary;
    daily:     RevenueDay[];
    bySource:  RevenueBySource[];
}

// ─────────────────────────────────────────────────────────────────────────────
// ARRIVALS / DEPARTURES REPORT
// ─────────────────────────────────────────────────────────────────────────────

export interface ArrivalDepartureEntry {
    _id:                string;
    confirmationNumber: string;
    guestName:          string;
    roomType:           string;
    roomNumber?:        string;
    checkInDate:        string;
    checkOutDate:       string;
    nights:             number;
    adults:             number;
    status:             string;
    source:             string;
    totalAmount:        number;
}

export interface ArrivalsDeparturesData {
    arrivals:   ArrivalDepartureEntry[];
    departures: ArrivalDepartureEntry[];
    inHouse:    ArrivalDepartureEntry[];
    summary: {
        totalArrivals:   number;
        totalDepartures: number;
        totalInHouse:    number;
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// NIGHT AUDIT REPORT
// ─────────────────────────────────────────────────────────────────────────────

export interface NightAuditEntry {
    _id:              string;
    businessDate:     string;
    runAt:            string;
    status:           "completed" | "failed";
    chargesPosted:    number;
    summary: {
        roomsOccupied:    number;
        roomsAvailable:   number;
        occupancyPercent: number;
        roomRevenue:      number;
        otherRevenue:     number;
        totalRevenue:     number;
        totalCollections: number;
        totalOutstanding: number;
        arrivalsCount:    number;
        departuresCount:  number;
        inHouseCount:     number;
        noShowCount:      number;
    };
    runBy: {
        _id:  string;
        name: string;
    };
}

export interface NightAuditListData {
    audits:     NightAuditEntry[];
    pagination: import("./api.types").PaginationMeta;
}