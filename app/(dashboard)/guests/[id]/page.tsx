"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, FileText, MapPin, Shield } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { GuestProfileHeader } from "@/components/guests/GuestProfileHeader";
import { GuestDrawer } from "@/components/guests/GuestDrawer";
import { useGuest } from "@/hooks/guests/useGuests";

// ─── Detail section card ─────────────────────────────────────────────────────
const DetailCard = ({ title, icon: Icon, children }: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) => (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        </div>
        <Separator />
        {children}
    </div>
);

// ─── Row inside a detail card ─────────────────────────────────────────────────
const DetailRow = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="flex justify-between gap-4 text-sm">
        <span className="text-muted-foreground flex-shrink-0">{label}</span>
        <span className="text-foreground font-medium text-right">{value ?? "—"}</span>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────

export default function GuestProfilePage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: guest, isLoading } = useGuest(id);
    const [editOpen, setEditOpen] = useState(false);

    // ── Loading skeleton ──────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="p-6 space-y-5 max-w-4xl">
                <Skeleton className="h-5 w-24 rounded" />
                <Skeleton className="h-36 w-full rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-48 rounded-xl" />
                    <Skeleton className="h-48 rounded-xl" />
                </div>
            </div>
        );
    }

    if (!guest) {
        return (
            <div className="p-6 text-sm text-muted-foreground">
                Guest not found.{" "}
                <button onClick={() => router.back()} className="underline">Go back</button>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-5 max-w-4xl">

            {/* Back */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/guests")}
                className="-ml-2 text-muted-foreground"
            >
                <ArrowLeft className="w-4 h-4 mr-1" /> Guests
            </Button>

            {/* Profile header */}
            <GuestProfileHeader guest={guest} onEdit={() => setEditOpen(true)} />

            {/* Detail grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* ID & personal */}
                <DetailCard title="ID & personal" icon={Shield}>
                    <div className="space-y-3">
                        <DetailRow label="Gender" value={guest.gender} />
                        <DetailRow label="Nationality" value={guest.nationality} />
                        <DetailRow label="ID type" value={guest.idType} />
                        <DetailRow label="ID number" value={guest.idNumber} />
                        <DetailRow
                            label="Date of birth"
                            value={
                                guest.dateOfBirth
                                    ? format(new Date(guest.dateOfBirth), "dd MMM yyyy")
                                    : null
                            }
                        />
                    </div>
                </DetailCard>

                {/* Address */}
                <DetailCard title="Address" icon={MapPin}>
                    <div className="space-y-3">
                        <DetailRow label="Street" value={guest.address?.line1} />
                        <DetailRow label="City" value={guest.address?.city} />
                        <DetailRow label="State" value={guest.address?.state} />
                        <DetailRow label="Country" value={guest.address?.country} />
                        <DetailRow label="Pincode" value={guest.address?.pincode} />
                    </div>
                </DetailCard>

                {/* Preferences */}
                <DetailCard title="Preferences" icon={FileText}>
                    <div className="space-y-3">
                        <DetailRow label="Floor" value={guest.preferences?.floorPreference} />
                        <DetailRow label="Bed" value={guest.preferences?.bedPreference} />
                        <DetailRow label="Pillow" value={guest.preferences?.pillow} />
                        <DetailRow
                            label="Dietary"
                            value={guest.preferences?.dietary?.join(", ")}
                        />
                        <DetailRow
                            label="Special requests"
                            value={guest.preferences?.specialRequests}
                        />
                    </div>
                </DetailCard>

                {/* Stay stats */}
                <DetailCard title="Stay history" icon={CreditCard}>
                    <div className="space-y-3">
                        <DetailRow label="Total stays" value={guest.totalStays} />
                        <DetailRow
                            label="Total spend"
                            value={
                                guest.totalSpend > 0
                                    ? `₹${guest.totalSpend.toLocaleString("en-IN")}`
                                    : "₹0"
                            }
                        />
                        <DetailRow label="Loyalty points" value={guest.loyaltyPoints} />
                        <DetailRow
                            label="Last stay"
                            value={
                                guest.lastStayAt
                                    ? format(new Date(guest.lastStayAt), "dd MMM yyyy")
                                    : null
                            }
                        />
                        <DetailRow
                            label="Profile created"
                            value={format(new Date(guest.createdAt), "dd MMM yyyy")}
                        />
                    </div>
                </DetailCard>
            </div>

            {/* Internal notes */}
            {guest.notes && (
                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/40 rounded-xl p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-yellow-700 dark:text-yellow-400 mb-2">
                        Internal notes (staff only)
                    </p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{guest.notes}</p>
                </div>
            )}

            {/* Edit drawer */}
            <GuestDrawer
                open={editOpen}
                onOpenChange={setEditOpen}
                guest={guest}
            />
        </div>
    );
}