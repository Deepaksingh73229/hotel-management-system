"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw, Home, Hotel } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
    const router = useRouter();

    useEffect(() => {
        // Log to your error monitoring service here (e.g. Sentry)
        console.error("[StayOS error boundary]", error);
    }, [error]);

    const isDev = process.env.NODE_ENV === "development";

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">

            {/* Subtle grid */}
            <div
                className="pointer-events-none fixed inset-0 opacity-[0.03] dark:opacity-[0.04]"
                style={{
                    backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                                      linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                    backgroundSize: "48px 48px",
                }}
            />

            <div className="relative space-y-6 max-w-md">

                {/* Logo */}
                <div className="flex justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
                        <Hotel className="w-7 h-7 text-destructive" />
                    </div>
                </div>

                {/* Icon + heading */}
                <div className="space-y-3">
                    <div className="flex justify-center">
                        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-destructive" />
                        </div>
                    </div>
                    <h1 className="text-xl font-semibold text-foreground">
                        Something went wrong
                    </h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        An unexpected error occurred. You can try again or return to the dashboard.
                        If the problem persists, contact your system administrator.
                    </p>
                </div>

                {/* Dev error details */}
                {isDev && error.message && (
                    <div className="text-left bg-destructive/5 border border-destructive/20 rounded-xl p-4 space-y-2">
                        <p className="text-xs font-semibold text-destructive uppercase tracking-wide">
                            Error details (dev only)
                        </p>
                        <p className="text-xs font-mono text-foreground break-all">
                            {error.message}
                        </p>
                        {error.digest && (
                            <p className="text-xs text-muted-foreground font-mono">
                                Digest: {error.digest}
                            </p>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                        variant="outline"
                        onClick={reset}
                        className="w-full sm:w-auto gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try again
                    </Button>
                    <Button
                        onClick={() => router.push("/dashboard")}
                        className="w-full sm:w-auto gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Dashboard
                    </Button>
                </div>

                {error.digest && !isDev && (
                    <p className="text-xs text-muted-foreground">
                        Error reference: <span className="font-mono">{error.digest}</span>
                    </p>
                )}
            </div>

            {/* Footer */}
            <p className="absolute bottom-6 text-xs text-muted-foreground">
                StayOS · Property Management System
            </p>
        </div>
    );
}