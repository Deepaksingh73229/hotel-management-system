"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar }  from "@/components/layout/Topbar";
import { useAuthStore } from "@/stores/auth.store";

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD LAYOUT — ERP Shell
//
// This layout wraps every page inside (dashboard)/.
// It acts as the route guard: if the user is not authenticated after hydration,
// redirect them to /login.
//
// Structure:
//   <html>
//     <body>
//       <Providers>
//         ┌─────────────────────────────────────────────┐
//         │  Sidebar (fixed height, collapsible)        │
//         │  ┌──────────────────────────────────────┐  │
//         │  │  Topbar (fixed, 56px)                │  │
//         │  ├──────────────────────────────────────┤  │
//         │  │  <children /> (scrollable)           │  │
//         │  └──────────────────────────────────────┘  │
//         └─────────────────────────────────────────────┘
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, isHydrating } = useAuthStore();

    useEffect(() => {
        if (!isHydrating && !isAuthenticated) {
            router.replace("/login");
        }
    }, [isAuthenticated, isHydrating, router]);

    // Show nothing while the auth state is being resolved.
    // This prevents a flash of the dashboard for unauthenticated users.
    if (isHydrating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    {/* Minimal loading indicator — no spinner library needed */}
                    <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <p className="text-xs text-muted-foreground">Loading…</p>
                </div>
            </div>
        );
    }

    // Not yet authenticated (redirect in progress) — render nothing.
    if (!isAuthenticated) return null;

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Permanent sidebar — never unmounts, just collapses */}
            <Sidebar />

            {/* Main content area */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Topbar />

                {/* Page content — this is the only scrollable region */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}