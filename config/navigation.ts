import {
    LayoutDashboard,
    CalendarDays,
    BedDouble,
    Users,
    CreditCard,
    BarChart3,
    UserCog,
    ScrollText,
    Settings,
    type LucideIcon,
} from "lucide-react";

import type { RoleName } from "@/types";

export interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
    /** If provided, only users with these roles can see this item. */
    roles?: RoleName[];
    /** Shown as a divider above this group of items. */
    groupLabel?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// NAV ITEMS
// Order = display order in the sidebar.
// Items without `roles` are visible to all authenticated users.
// ─────────────────────────────────────────────────────────────────────────────

export const NAV_ITEMS: NavItem[] = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Reservations",
        href: "/reservations",
        icon: CalendarDays,
    },
    {
        label: "Rooms",
        href: "/rooms",
        icon: BedDouble,
    },
    {
        label: "Guests",
        href: "/guests",
        icon: Users,
    },
    {
        label: "Billing",
        href: "/billing",
        icon: CreditCard,
    },
    {
        label: "Reports",
        href: "/reports",
        icon: BarChart3,
        groupLabel: "Analytics",
    },
    {
        label: "Staff",
        href: "/staff",
        icon: UserCog,
        groupLabel: "Administration",
        roles: ["admin"],
    },
    {
        label: "Audit Logs",
        href: "/audit-logs",
        icon: ScrollText,
        roles: ["admin"],
    },
    {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        roles: ["admin"],
    },
];