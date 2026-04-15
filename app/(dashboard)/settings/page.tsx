"use client";

import { useState } from "react";
import { ShieldOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermission } from "@/hooks/auth/usePermission";
import { PageHeader } from "@/components/common/PageHeader";
import { PropertySettings } from "@/components/settings/PropertySettings";
import { FloorSettings } from "@/components/settings/FloorSettings";
import { RoomTypeSettings } from "@/components/settings/RoomTypeSettings";
import { RoomSettings } from "@/components/settings/RoomSettings";
import { RatePlanSettings } from "@/components/settings/RatePlanSettings";
import { RoomBlockSettings } from "@/components/settings/RoomBlockSettings";
import { AvailabilityChecker } from "@/components/settings/AvailabilityChecker";

const TABS = [
    { key: "property", label: "Property" },
    { key: "floors", label: "Floors" },
    { key: "room-types", label: "Room types" },
    { key: "rooms", label: "Rooms" },
    { key: "rate-plans", label: "Rate plans" },
    { key: "blocks", label: "Room blocks" },
    { key: "availability", label: "Availability" },
] as const;

type TabKey = typeof TABS[number]["key"];

export default function SettingsPage() {
    const { isAdmin } = usePermission();
    const [active, setActive] = useState<TabKey>("property");

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <ShieldOff className="w-5 h-5 text-destructive" />
                </div>
                <p className="text-sm font-medium">Access restricted</p>
                <p className="text-sm text-muted-foreground">Admin only.</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-5xl">
            <PageHeader
                title="Settings"
                subtitle="Configure your property, rooms, room types, rate plans and blocks."
            />

            {/* Tab bar */}
            <div className="flex gap-0.5 bg-muted/50 border border-border rounded-xl p-1 w-fit flex-wrap">
                {TABS.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setActive(key)}
                        className={cn(
                            "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all",
                            active === key
                                ? "bg-card text-foreground shadow-sm border border-border"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Panel */}
            <div>
                {active === "property" && <PropertySettings />}
                {active === "floors" && <FloorSettings />}
                {active === "room-types" && <RoomTypeSettings />}
                {active === "rooms" && <RoomSettings />}
                {active === "rate-plans" && <RatePlanSettings />}
                {active === "blocks" && <RoomBlockSettings />}
                {active === "availability" && <AvailabilityChecker />}
            </div>
        </div>
    );
}