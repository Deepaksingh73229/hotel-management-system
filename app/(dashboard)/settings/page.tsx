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
import { RoleManager } from "@/components/roles/RoleManager";
import { PermissionManager } from "@/components/roles/PermissionManager";

// ─── Top-level tabs ───────────────────────────────────────────────────────────
const TABS = [
    { key: "property", label: "Property" },
    { key: "floors", label: "Floors" },
    { key: "room-types", label: "Room types" },
    { key: "rooms", label: "Rooms" },
    { key: "rate-plans", label: "Rate plans" },
    { key: "blocks", label: "Room blocks" },
    { key: "availability", label: "Availability" },
    { key: "roles", label: "Roles & permissions" },
] as const;

type TabKey = typeof TABS[number]["key"];

// ─── Sub-tabs inside Roles & permissions ──────────────────────────────────────
const ROLE_SUBTABS = [
    { key: "roles", label: "Roles" },
    { key: "permissions", label: "Permissions" },
] as const;

type RoleSubTab = typeof ROLE_SUBTABS[number]["key"];

function TabBar<T extends string>({
    tabs,
    active,
    onChange,
    size = "md",
}: {
    tabs: readonly { key: T; label: string }[];
    active: T;
    onChange: (key: T) => void;
    size?: "sm" | "md";
}) {
    return (
        <div className={cn(
            "flex gap-0.5 bg-muted/50 border border-border rounded-xl w-fit flex-wrap",
            size === "sm" ? "p-0.5" : "p-1"
        )}>
            {tabs.map(({ key, label }) => (
                <button
                    key={key}
                    onClick={() => onChange(key)}
                    className={cn(
                        "rounded-lg font-medium transition-all",
                        size === "sm"
                            ? "px-3 py-1 text-xs"
                            : "px-3.5 py-1.5 text-sm",
                        active === key
                            ? "bg-card text-foreground shadow-sm border border-border"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}

export default function SettingsPage() {
    const { isAdmin } = usePermission();
    const [active, setActive] = useState<TabKey>("property");
    const [roleSubTab, setRoleSubTab] = useState<RoleSubTab>("roles");

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
                subtitle="Configure your property, rooms, rate plans, and access control."
            />

            {/* Main tabs */}
            <TabBar tabs={TABS} active={active} onChange={setActive} />

            {/* Panels */}
            <div>
                {active === "property" && <PropertySettings />}
                {active === "floors" && <FloorSettings />}
                {active === "room-types" && <RoomTypeSettings />}
                {active === "rooms" && <RoomSettings />}
                {active === "rate-plans" && <RatePlanSettings />}
                {active === "blocks" && <RoomBlockSettings />}
                {active === "availability" && <AvailabilityChecker />}

                {active === "roles" && (
                    <div className="space-y-5">
                        {/* Sub-tab bar */}
                        <TabBar
                            tabs={ROLE_SUBTABS}
                            active={roleSubTab}
                            onChange={setRoleSubTab}
                            size="sm"
                        />

                        {/* Info banner */}
                        <div className="rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/40 px-4 py-3 text-xs text-blue-700 dark:text-blue-300 space-y-1">
                            {roleSubTab === "roles" ? (
                                <>
                                    <p className="font-medium">Managing roles</p>
                                    <p className="text-blue-600 dark:text-blue-400">
                                        Create and name roles, toggle them active or inactive,
                                        and click <strong>Assign permissions</strong> to open
                                        the permission matrix for each role.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="font-medium">Managing permissions</p>
                                    <p className="text-blue-600 dark:text-blue-400">
                                        Click <strong>Seed all</strong> to generate every module × action
                                        combination at once. You can also add individual permissions or
                                        delete ones you don't need. Deleting a permission removes it
                                        from all roles automatically.
                                    </p>
                                </>
                            )}
                        </div>

                        {roleSubTab === "roles" && <RoleManager />}
                        {roleSubTab === "permissions" && <PermissionManager />}
                    </div>
                )}
            </div>
        </div>
    );
}