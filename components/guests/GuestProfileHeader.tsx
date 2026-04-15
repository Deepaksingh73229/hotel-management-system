"use client";

import { Pencil, Phone, Mail, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuestTagBadge } from "./GuestTagBadge";
import { guestFullName } from "@/types";
import type { Guest } from "@/types";

const initials = (g: Guest) =>
    `${g.firstName[0] ?? ""}${g.lastName[0] ?? ""}`.toUpperCase();

const StatPill = ({ label, value }: { label: string; value: string | number }) => (
    <div className="text-center px-4 py-3 bg-muted/50 rounded-xl min-w-[80px]">
        <p className="text-lg font-semibold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
);

interface GuestProfileHeaderProps {
    guest: Guest;
    onEdit: () => void;
}

export function GuestProfileHeader({ guest, onEdit }: GuestProfileHeaderProps) {
    const locationParts = [guest.address?.city, guest.address?.country].filter(Boolean);

    return (
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">

            {/* ── Top row: avatar + info + edit ─────────────────────── */}
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-semibold flex-shrink-0">
                    {initials(guest)}
                </div>

                {/* Name + contact + location */}
                <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-foreground leading-tight">
                            {guestFullName(guest)}
                        </h3>
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                            {guest.tags?.map((tag) => (
                                <GuestTagBadge key={tag} tag={tag} />
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {guest.phone && (
                            <span className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5" /> {guest.phone}
                            </span>
                        )}
                        {guest.email && (
                            <span className="flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5" /> {guest.email}
                            </span>
                        )}
                        {locationParts.length > 0 && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" /> {locationParts.join(", ")}
                            </span>
                        )}
                    </div>
                </div>

                {/* Edit button */}
                <Button variant="outline" size="sm" onClick={onEdit} className="flex-shrink-0">
                    <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                </Button>
            </div>

            {/* ── Stats strip ─────────────────────────────────────── */}
            <div className="flex gap-3 flex-wrap">
                <StatPill label="Total stays" value={guest.totalStays} />
                <StatPill
                    label="Total spend"
                    value={
                        guest.totalSpend > 0
                            ? `₹${guest.totalSpend.toLocaleString("en-IN")}`
                            : "₹0"
                    }
                />
                <StatPill label="Loyalty pts" value={guest.loyaltyPoints} />
                {guest.nationality && (
                    <StatPill label="Nationality" value={guest.nationality} />
                )}
            </div>
        </div>
    );
}