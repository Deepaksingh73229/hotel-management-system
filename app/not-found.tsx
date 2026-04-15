"use client";

import { useRouter } from "next/navigation";
import { Hotel, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">

            {/* Subtle background grid */}
            <div
                className="pointer-events-none fixed inset-0 opacity-[0.03] dark:opacity-[0.04]"
                style={{
                    backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                                      linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                    backgroundSize: "48px 48px",
                }}
            />

            <div className="relative space-y-6 max-w-sm">

                {/* Logo mark */}
                <div className="flex justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Hotel className="w-7 h-7 text-primary" />
                    </div>
                </div>

                {/* 404 number */}
                <div>
                    <p className="text-8xl font-bold tracking-tight text-foreground/10 select-none leading-none">
                        404
                    </p>
                </div>

                {/* Message */}
                <div className="space-y-2">
                    <h1 className="text-xl font-semibold text-foreground">
                        Page not found
                    </h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        The page you're looking for doesn't exist or has been moved.
                        Check the URL or head back to the dashboard.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="w-full sm:w-auto gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go back
                    </Button>
                    <Button
                        onClick={() => router.push("/dashboard")}
                        className="w-full sm:w-auto gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Dashboard
                    </Button>
                </div>
            </div>

            {/* Footer */}
            <p className="absolute bottom-6 text-xs text-muted-foreground">
                StayOS · Property Management System
            </p>
        </div>
    );
}