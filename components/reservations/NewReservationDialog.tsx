"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { differenceInDays, parseISO, isAfter, format } from "date-fns";
import { Search, Loader2, CalendarDays } from "lucide-react";

import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
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
import { useGuests } from "@/hooks/guests/useGuests";
import { useRoomTypes } from "@/hooks/settings/useSettings";
import { guestFullName } from "@/types";
import type { ReservationSource } from "@/types/reservation.types";

// ─── Schema mirrors createReservation controller body ─────────────────────────
const schema = z.object({
    primaryGuestId: z.string().min(1, "Select a guest"),
    roomTypeId: z.string().min(1, "Select a room type"),
    checkInDate: z.string().min(1, "Required"),
    checkOutDate: z.string().min(1, "Required"),
    adults: z.coerce.number().min(1, "At least 1 adult"),
    children: z.coerce.number().min(0).default(0),
    ratePerNight: z.coerce.number().min(1, "Enter a rate"),
    depositAmount: z.coerce.number().min(0).default(0),
    source: z.string().default("direct"),
    arrivalTime: z.string().optional(),
    specialRequests: z.string().optional(),
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

const Section = ({ label }: { label: string }) => (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
    </p>
);

const Field = ({ label, error, children, required }: {
    label: string;
    error?: string;
    children: React.ReactNode;
    required?: boolean;
}) => (
    <div className="space-y-1.5">
        <Label className="text-xs">
            {label}{required && " *"}
        </Label>
        {children}
        {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
);

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NewReservationDialog({ open, onOpenChange }: Props) {
    const [guestSearch, setGuestSearch] = useState("");

    const createMutation = useCreateReservation();
    const { data: roomTypes = [] } = useRoomTypes();
    const { data: guestData } = useGuests({
        search: guestSearch || undefined,
        limit: 20,
    });
    const guests = guestData?.guests ?? [];

    const {
        register, handleSubmit, control,
        watch, reset, setValue,
        formState: { errors },
    } = useForm<FormValues>({ resolver: zodResolver(schema) });

    const checkIn = watch("checkInDate");
    const checkOut = watch("checkOutDate");
    const rate = watch("ratePerNight") ?? 0;
    const deposit = watch("depositAmount") ?? 0;

    const nights = (checkIn && checkOut && isAfter(parseISO(checkOut), parseISO(checkIn)))
        ? differenceInDays(parseISO(checkOut), parseISO(checkIn))
        : 0;

    const totalRoomCharge = nights * Number(rate);

    // Auto-fill rate from room type base rate
    const roomTypeId = watch("roomTypeId");
    useEffect(() => {
        if (!roomTypeId) return;
        const rt = roomTypes.find((r) => r._id === roomTypeId);
        if (rt) setValue("ratePerNight", rt.baseRate);
    }, [roomTypeId, roomTypes, setValue]);

    const handleClose = () => { reset(); setGuestSearch(""); onOpenChange(false); };

    const onSubmit = (values: FormValues) => {
        createMutation.mutate(
            {
                primaryGuestId: values.primaryGuestId,
                roomTypeId: values.roomTypeId,
                checkInDate: values.checkInDate,
                checkOutDate: values.checkOutDate,
                adults: values.adults,
                children: values.children,
                ratePerNight: values.ratePerNight,
                depositAmount: values.depositAmount,
                source: values.source as ReservationSource,
                arrivalTime: values.arrivalTime || undefined,
                specialRequests: values.specialRequests || undefined,
            },
            { onSuccess: handleClose }
        );
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>New reservation</DialogTitle>
                    <DialogDescription>
                        Fill in the details to create a confirmed reservation.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 pt-1">

                    {/* ── GUEST ─────────────────────────────────────── */}
                    <Section label="Guest" />

                    <Field label="Search and select guest" required error={errors.primaryGuestId?.message}>
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
                                name="primaryGuestId"
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className={`h-9 text-sm ${errors.primaryGuestId ? "border-destructive" : ""}`}>
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
                                                    {g.phone && (
                                                        <span className="text-muted-foreground ml-2">
                                                            · {g.phone}
                                                        </span>
                                                    )}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </Field>

                    <Separator />

                    {/* ── ROOM & DATES ──────────────────────────────── */}
                    <Section label="Room & dates" />

                    <Field label="Room type" required error={errors.roomTypeId?.message}>
                        <Controller
                            name="roomTypeId"
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className={`h-9 text-sm ${errors.roomTypeId ? "border-destructive" : ""}`}>
                                        <SelectValue placeholder="Select room type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roomTypes.map((rt) => (
                                            <SelectItem key={rt._id} value={rt._id}>
                                                {rt.name}
                                                <span className="text-muted-foreground ml-2">
                                                    · ₹{rt.baseRate.toLocaleString("en-IN")}/night
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Check-in" required error={errors.checkInDate?.message}>
                            <Input
                                type="date"
                                {...register("checkInDate")}
                                className={`h-9 text-sm ${errors.checkInDate ? "border-destructive" : ""}`}
                            />
                        </Field>
                        <Field label="Check-out" required error={errors.checkOutDate?.message}>
                            <Input
                                type="date"
                                {...register("checkOutDate")}
                                min={checkIn}
                                className={`h-9 text-sm ${errors.checkOutDate ? "border-destructive" : ""}`}
                            />
                        </Field>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <Field label="Adults" required error={errors.adults?.message}>
                            <Input
                                type="number" min={1} defaultValue={2}
                                {...register("adults")}
                                className={`h-9 text-sm ${errors.adults ? "border-destructive" : ""}`}
                            />
                        </Field>
                        <Field label="Children">
                            <Input
                                type="number" min={0} defaultValue={0}
                                {...register("children")}
                                className="h-9 text-sm"
                            />
                        </Field>
                        <Field label="Arrival time">
                            <Input
                                type="time"
                                {...register("arrivalTime")}
                                className="h-9 text-sm"
                            />
                        </Field>
                    </div>

                    <Separator />

                    {/* ── PRICING ───────────────────────────────────── */}
                    <Section label="Pricing" />

                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Rate / night (₹)" required error={errors.ratePerNight?.message}>
                            <Input
                                type="number" min={0}
                                {...register("ratePerNight")}
                                className={`h-9 text-sm ${errors.ratePerNight ? "border-destructive" : ""}`}
                            />
                        </Field>
                        <Field label="Deposit (₹)">
                            <Input
                                type="number" min={0} defaultValue={0}
                                {...register("depositAmount")}
                                className="h-9 text-sm"
                            />
                        </Field>
                    </div>

                    {/* Live total */}
                    {nights > 0 && (
                        <div className="flex items-center justify-between rounded-lg bg-muted/40 border border-border px-4 py-2.5 text-sm">
                            <span className="text-muted-foreground">
                                ₹{Number(rate).toLocaleString("en-IN")} × {nights} night{nights !== 1 ? "s" : ""}
                            </span>
                            <span className="font-semibold text-foreground">
                                ₹{totalRoomCharge.toLocaleString("en-IN")}
                            </span>
                        </div>
                    )}

                    <Separator />

                    {/* ── DETAILS ───────────────────────────────────── */}
                    <Section label="Details" />

                    <Field label="Booking source">
                        <Controller
                            name="source"
                            control={control}
                            defaultValue="direct"
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className="h-9 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SOURCES.map((s) => (
                                            <SelectItem key={s.value} value={s.value}>
                                                {s.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </Field>

                    <Field label="Special requests">
                        <Textarea
                            {...register("specialRequests")}
                            placeholder="e.g. High floor, extra pillows, food service…"
                            rows={3}
                            className="text-sm resize-none"
                        />
                    </Field>

                    {/* ── Actions ───────────────────────────────────── */}
                    <div className="flex gap-3 pt-1">
                        <Button
                            type="button" variant="outline" className="flex-1"
                            onClick={handleClose}
                            disabled={createMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit" className="flex-1"
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending
                                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating…</>
                                : "Create reservation"
                            }
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}