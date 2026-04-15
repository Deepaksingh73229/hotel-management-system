"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
    const router = useRouter();
    const isDev = process.env.NODE_ENV === "development";

    useEffect(() => {
        console.error("[StayOS dashboard error]", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center h-full py-24 px-6 text-center">

            <div className="space-y-5 max-w-sm">

                {/* Icon */}
                <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-destructive" />
                    </div>
                </div>

                {/* Text */}
                <div className="space-y-2">
                    <h2 className="text-base font-semibold text-foreground">
                        Something went wrong
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        This section failed to load. Try again or navigate to a different page.
                    </p>
                </div>

                {/* Dev details */}
                {isDev && error.message && (
                    <div className="text-left bg-destructive/5 border border-destructive/20 rounded-xl p-3 space-y-1">
                        <p className="text-xs font-semibold text-destructive uppercase tracking-wide">
                            Dev info
                        </p>
                        <p className="text-xs font-mono text-foreground break-all">
                            {error.message}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.back()}
                        className="w-full sm:w-auto gap-1.5"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Go back
                    </Button>
                    <Button
                        size="sm"
                        onClick={reset}
                        className="w-full sm:w-auto gap-1.5"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Try again
                    </Button>
                </div>
            </div>
        </div>
    );
}