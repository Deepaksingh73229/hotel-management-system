// ─────────────────────────────────────────────────────────────────────────────
// API RESPONSE ENVELOPES
// These mirror the shapes your Express backend sends back.
// Every service function must return one of these.
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data: T;
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: {
        [key: string]: T[];         // e.g. { users: User[] } or { reservations: Reservation[] }
        pagination: PaginationMeta;
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// API ERROR
// Shape returned by your Express globalErrorHandler on failure.
// ─────────────────────────────────────────────────────────────────────────────

export interface FieldError {
    field: string;
    message: string;
}

export interface ApiError {
    success: false;
    code: string;           // e.g. "INVALID_CREDENTIALS", "NOT_FOUND"
    message: string;
    errors?: FieldError[];     // present on 422 validation failures
}

// ─────────────────────────────────────────────────────────────────────────────
// QUERY PARAMS
// Generic shapes for list endpoints that support filtering + pagination.
// Extend per-resource in their own type files.
// ─────────────────────────────────────────────────────────────────────────────

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface SearchParams extends PaginationParams {
    search?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HTTP METHOD UNION
// Used to annotate client.ts request config.
// ─────────────────────────────────────────────────────────────────────────────

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";