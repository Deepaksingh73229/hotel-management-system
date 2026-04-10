"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { env } from "@/config/env";

// ─────────────────────────────────────────────────────────────────────────────
// QUERY CLIENT DEFAULTS
// These are tuned for an ERP — most data is server-authoritative and
// should be considered stale quickly, but we avoid hammering the API
// on every focus/reconnect during active use.
// ─────────────────────────────────────────────────────────────────────────────

const makeQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 2,    // 2 min — data freshness window
                gcTime: 1000 * 60 * 10,   // 10 min — keep unused data in cache
                retry: 1,                 // retry once on failure
                refetchOnWindowFocus: false,             // ERP staff don't tab-switch constantly
                refetchOnReconnect: true,
            },
            mutations: {
                retry: 0,                               // never retry mutations silently
            },
        },
    });

interface QueryProviderProps {
    children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
    // useState ensures the QueryClient is created once per component lifecycle,
    // not recreated on every render (important for Next.js SSR compatibility).
    const [queryClient] = useState(makeQueryClient);

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {env.IS_DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
    );
}