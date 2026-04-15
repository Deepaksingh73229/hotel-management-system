import { Hotel } from "lucide-react";

export default function Loading() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                {/* Logo pulse */}
                <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Hotel className="w-6 h-6 text-primary" />
                    </div>
                    {/* Ripple ring */}
                    <span className="absolute inset-0 rounded-xl border border-primary/30 animate-ping" />
                </div>
                <p className="text-sm text-muted-foreground">Loading…</p>
            </div>
        </div>
    );
}