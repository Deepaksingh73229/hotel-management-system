"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { differenceInDays, parseISO, isAfter } from "date-fns";

import {
    Sheet, SheetContent, SheetHeader,
    SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useCreateReservation } from "@/hooks/reservations/useReservations";
import { useRoomTypes } from "@/hooks/rooms/useRooms";
import { useGuests } from "@/hooks/guests/useGuests";
import { guestFullName } from "@/types";
import type { ReservationSource } from "@/types";

// ─── Schema ───────────────────────────────────────────────────────────────────
const schema = z.object({
    primaryGuest: z.string().min(1, "Select a guest"),
    roomType: z.string().min(1, "Select a room type"),
    checkInDate: z.string().min(1, "Check-in date is required"),
    checkOutDate: z.string().min(1, "Check-out date is required"),
    adults: z.coerce.number().min(1, "At least 1 adult"),
    children: z.coerce.number().min(0).default(0),
    ratePerNight: z.coerce.number().min(1, "Rate must be greater than 0"),
    source: z.string().default("direct"),
    arrivalTime: z.string().optional(),
    specialRequests: z.string().optional(),
    depositAmount: z.coerce.number().min(0).default(0),
}).refine(
    (d) => isAfter(parseISO(d.checkOutDate), parseISO(d.checkInDate)),
    { message: "Check-out must be after check-in", path: ["checkOutDate"] }
);

type FormValues = z.infer<typeof schema>;

const SOURCES: { value: ReservationSource; label: string }[] = [
    { value: "direct", label: "Direct" },
    { value: "walk_in", label: "Walk-in" },
    { value: "phone", label: "Phone" },
    { value: "ota_booking", label: "OTA (generic)" },
    { value: "ota_expedia", label: "Expedia" },
    { value: "ota_mmt", label: "MakeMyTrip" },
    { value: "corporate", label: "Corporate" },
    { value: "agent", label: "Agent" },
];

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 pt-1">
        {children}
    </p>
);

const Field = ({ label, error, children }: {
    label: string; error?: string; children: React.ReactNode;
}) => (
    <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        {children}
        {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
);

interface NewReservationDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NewReservationDrawer({ open, onOpenChange }: NewReservationDrawerProps) {
    const [guestSearch, setGuestSearch] = useState("");

    const createReservation = useCreateReservation();
    const { data: roomTypes = [] } = useRoomTypes();
    const { data: guestData } = useGuests({
        search: guestSearch || undefined,
        limit: 20,
    });
    const guests = guestData?.guests ?? [];

    const {
        register, handleSubmit, control, watch, reset,
        formState: { errors },
    } = useForm<FormValues>({ resolver: zodResolver(schema) });

    const checkIn = watch("checkInDate");
    const checkOut = watch("checkOutDate");
    const rate = watch("ratePerNight") ?? 0;

    const nights = (checkIn && checkOut && isAfter(parseISO(checkOut), parseISO(checkIn)))
        ? differenceInDays(parseISO(checkOut), parseISO(checkIn))
        : 0;

    const totalRoomCharge = nights * (Number(rate) || 0);

    const onSubmit = (values: FormValues) => {
        createReservation.mutate(
            {
                primaryGuest: values.primaryGuest,
                roomType: values.roomType,
                checkInDate: values.checkInDate,
                checkOutDate: values.checkOutDate,
                adults: values.adults,
                children: values.children,
                ratePerNight: values.ratePerNight,
                source: values.source as ReservationSource,
                arrivalTime: values.arrivalTime || undefined,
                specialRequests: values.specialRequests || undefined,
                depositAmount: values.depositAmount,
            },
            {
                onSuccess: () => {
                    reset();
                    setGuestSearch("");
                    onOpenChange(false);
                },
            }
        );
    };

    return (
        <Sheet open={open} onOpenChange={(v) => { if (!v) { reset(); setGuestSearch(""); } onOpenChange(v); }}>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle>New reservation</SheetTitle>
                    <SheetDescription>
                        Fill in the details to create a confirmed reservation.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

                    {/* ── Guest ──────────────────────────────────────── */}
                    <SectionTitle>Guest</SectionTitle>

                    <Field label="Search and select guest *" error={errors.primaryGuest?.message}>
                        <div className="space-y-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                                <Input
                                    placeholder="Type name, email or phone…"
                                    value={guestSearch}
                                    onChange={(e) => setGuestSearch(e.target.value)}
                                    className="pl-8 h-9 text-sm"
                                />
                            </div>
                            <Controller
                                name="primaryGuest"
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className={`h-9 text-sm ${errors.primaryGuest ? "border-destructive" : ""}`}>
                                            <SelectValue placeholder="Select guest" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {guests.length === 0 && (
                                                <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                                                    {guestSearch ? "No guests found." : "Type to search guests."}
                                                </div>
                                            )}
                                            {guests.map((g) => (
                                                <SelectItem key={g._id} value={g._id}>
                                                    {guestFullName(g)}
                                                    {g.phone && ` · ${g.phone}`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </Field>

                    {/* ── Room & dates ───────────────────────────────── */}
                    <SectionTitle>Room & dates</SectionTitle>

                    <Field label="Room type *" error={errors.roomType?.message}>
                        <Controller
                            name="roomType"
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className={`h-9 text-sm ${errors.roomType ? "border-destructive" : ""}`}>
                                        <SelectValue placeholder="Select room type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roomTypes.map((rt) => (
                                            <SelectItem key={rt._id} value={rt._id}>
                                                {rt.name} · ₹{rt.baseRate.toLocaleString("en-IN")}/night
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Check-in *" error={errors.checkInDate?.message}>
                            <Input type="date" {...register("checkInDate")}
                                className={`h-9 text-sm ${errors.checkInDate ? "border-destructive" : ""}`} />
                        </Field>
                        <Field label="Check-out *" error={errors.checkOutDate?.message}>
                            <Input type="date" {...register("checkOutDate")}
                                className={`h-9 text-sm ${errors.checkOutDate ? "border-destructive" : ""}`} />
                        </Field>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <Field label="Adults *" error={errors.adults?.message}>
                            <Input type="number" min={1} {...register("adults")}
                                defaultValue={1}
                                className={`h-9 text-sm ${errors.adults ? "border-destructive" : ""}`} />
                        </Field>
                        <Field label="Children">
                            <Input type="number" min={0} {...register("children")}
                                defaultValue={0} className="h-9 text-sm" />
                        </Field>
                        <Field label="Arrival time">
                            <Input type="time" {...register("arrivalTime")} className="h-9 text-sm" />
                        </Field>
                    </div>

                    {/* ── Pricing ────────────────────────────────────── */}
                    <SectionTitle>Pricing</SectionTitle>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Rate / night (₹) *" error={errors.ratePerNight?.message}>
                            <Input type="number" min={0} {...register("ratePerNight")}
                                className={`h-9 text-sm ${errors.ratePerNight ? "border-destructive" : ""}`} />
                        </Field>
                        <Field label="Deposit (₹)">
                            <Input type="number" min={0} {...register("depositAmount")}
                                defaultValue={0} className="h-9 text-sm" />
                        </Field>
                    </div>

                    {/* Live total preview */}
                    {nights > 0 && (
                        <div className="rounded-lg bg-muted/50 border border-border px-4 py-3 text-sm space-y-1">
                            <div className="flex justify-between text-muted-foreground">
                                <span>₹{Number(rate).toLocaleString("en-IN")} × {nights} night{nights !== 1 ? "s" : ""}</span>
                                <span className="font-medium text-foreground">
                                    ₹{totalRoomCharge.toLocaleString("en-IN")}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* ── Source & requests ──────────────────────────── */}
                    <SectionTitle>Details</SectionTitle>

                    <Field label="Booking source">
                        <Controller
                            name="source"
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange} defaultValue="direct">
                                    <SelectTrigger className="h-9 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SOURCES.map((s) => (
                                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </Field>

                    <Field label="Special requests">
                        <Textarea
                            {...register("specialRequests")}
                            placeholder="e.g. High floor, extra pillows…"
                            rows={3}
                            className="text-sm resize-none"
                        />
                    </Field>

                    <SheetFooter className="gap-2 pt-2">
                        <Button type="button" variant="outline"
                            onClick={() => { reset(); setGuestSearch(""); onOpenChange(false); }}
                            disabled={createReservation.isPending}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createReservation.isPending}>
                            {createReservation.isPending
                                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating…</>
                                : "Create reservation"
                            }
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}