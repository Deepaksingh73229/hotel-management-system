"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Guest, CreateGuestPayload, GuestTag } from "@/types";

// ─── Schema ───────────────────────────────────────────────────────────────────
const schema = z.object({
    title: z.enum(["Mr", "Mrs", "Ms", "Dr", "Other"]).optional(),
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    email: z.string().trim().toLowerCase().email("Enter a valid email").optional().or(z.literal("")),
    phone: z.string().trim().regex(/^\+?[0-9]{7,15}$/, "Invalid phone number").optional().or(z.literal("")),
    alternatePhone: z.string().trim().optional().or(z.literal("")),
    nationality: z.string().trim().optional(),
    gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
    idType: z.enum(["aadhaar", "passport", "driving_license", "voter_id", "pan", "other"]).optional(),
    idNumber: z.string().trim().optional(),
    // Address
    addressLine1: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    country: z.string().trim().optional(),
    pincode: z.string().trim().optional(),
    // Other
    notes: z.string().trim().optional(),
});

type FormValues = z.infer<typeof schema>;

// ─── Field helpers ────────────────────────────────────────────────────────────
const Field = ({ label, error, children }: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) => (
    <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
        </Label>
        {children}
        {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 pt-2">
        {children}
    </p>
);

// ─────────────────────────────────────────────────────────────────────────────

interface GuestFormProps {
    defaultValues?: Guest | null;
    isPending: boolean;
    onSubmit: (payload: CreateGuestPayload) => void;
    onCancel: () => void;
    submitLabel?: string;
}

export function GuestForm({
    defaultValues,
    isPending,
    onSubmit,
    onCancel,
    submitLabel = "Save guest",
}: GuestFormProps) {

    const { register, handleSubmit, control, reset, formState: { errors } } =
        useForm<FormValues>({ resolver: zodResolver(schema) });

    useEffect(() => {
        if (defaultValues) {
            reset({
                title: defaultValues.title,
                firstName: defaultValues.firstName,
                lastName: defaultValues.lastName,
                email: defaultValues.email ?? "",
                phone: defaultValues.phone ?? "",
                alternatePhone: defaultValues.alternatePhone ?? "",
                nationality: defaultValues.nationality ?? "",
                gender: defaultValues.gender,
                idType: defaultValues.idType,
                idNumber: defaultValues.idNumber ?? "",
                addressLine1: defaultValues.address?.line1 ?? "",
                city: defaultValues.address?.city ?? "",
                state: defaultValues.address?.state ?? "",
                country: defaultValues.address?.country ?? "",
                pincode: defaultValues.address?.pincode ?? "",
                notes: defaultValues.notes ?? "",
            });
        } else {
            reset({});
        }
    }, [defaultValues, reset]);

    const handleFormSubmit = (values: FormValues) => {
        onSubmit({
            title: values.title,
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email || undefined,
            phone: values.phone || undefined,
            alternatePhone: values.alternatePhone || undefined,
            nationality: values.nationality || undefined,
            gender: values.gender,
            idType: values.idType,
            idNumber: values.idNumber || undefined,
            address: {
                line1: values.addressLine1 || undefined,
                city: values.city || undefined,
                state: values.state || undefined,
                country: values.country || undefined,
                pincode: values.pincode || undefined,
            },
            notes: values.notes || undefined,
        });
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5" noValidate>

            {/* ── Personal info ─────────────────────────────────────── */}
            <SectionTitle>Personal information</SectionTitle>

            <div className="grid grid-cols-3 gap-3">
                {/* Title */}
                <Field label="Title" error={errors.title?.message}>
                    <Controller
                        name="title"
                        control={control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="h-9 text-sm">
                                    <SelectValue placeholder="—" />
                                </SelectTrigger>
                                <SelectContent>
                                    {["Mr", "Mrs", "Ms", "Dr", "Other"].map((t) => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </Field>

                {/* First name */}
                <div className="col-span-2">
                    <Field label="First name *" error={errors.firstName?.message}>
                        <Input
                            {...register("firstName")}
                            placeholder="Jane"
                            className={`h-9 text-sm ${errors.firstName ? "border-destructive" : ""}`}
                        />
                    </Field>
                </div>
            </div>

            <Field label="Last name *" error={errors.lastName?.message}>
                <Input
                    {...register("lastName")}
                    placeholder="Smith"
                    className={`h-9 text-sm ${errors.lastName ? "border-destructive" : ""}`}
                />
            </Field>

            <div className="grid grid-cols-2 gap-3">
                <Field label="Gender" error={errors.gender?.message}>
                    <Controller
                        name="gender"
                        control={control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="h-9 text-sm">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </Field>
                <Field label="Nationality">
                    <Input
                        {...register("nationality")}
                        placeholder="Indian"
                        className="h-9 text-sm"
                    />
                </Field>
            </div>

            {/* ── Contact ──────────────────────────────────────────── */}
            <SectionTitle>Contact</SectionTitle>

            <Field label="Email" error={errors.email?.message}>
                <Input
                    type="email"
                    {...register("email")}
                    placeholder="jane@example.com"
                    className={`h-9 text-sm ${errors.email ? "border-destructive" : ""}`}
                />
            </Field>

            <div className="grid grid-cols-2 gap-3">
                <Field label="Phone" error={errors.phone?.message}>
                    <Input
                        {...register("phone")}
                        placeholder="+91 98765 43210"
                        className={`h-9 text-sm ${errors.phone ? "border-destructive" : ""}`}
                    />
                </Field>
                <Field label="Alternate phone">
                    <Input
                        {...register("alternatePhone")}
                        placeholder="+91 ..."
                        className="h-9 text-sm"
                    />
                </Field>
            </div>

            {/* ── ID proof ─────────────────────────────────────────── */}
            <SectionTitle>ID proof</SectionTitle>

            <div className="grid grid-cols-2 gap-3">
                <Field label="ID type">
                    <Controller
                        name="idType"
                        control={control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="h-9 text-sm">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="aadhaar">Aadhaar</SelectItem>
                                    <SelectItem value="passport">Passport</SelectItem>
                                    <SelectItem value="driving_license">Driving license</SelectItem>
                                    <SelectItem value="voter_id">Voter ID</SelectItem>
                                    <SelectItem value="pan">PAN</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </Field>
                <Field label="ID number">
                    <Input
                        {...register("idNumber")}
                        placeholder="XXXX XXXX XXXX"
                        className="h-9 text-sm"
                    />
                </Field>
            </div>

            {/* ── Address ──────────────────────────────────────────── */}
            <SectionTitle>Address</SectionTitle>

            <Field label="Street address">
                <Input
                    {...register("addressLine1")}
                    placeholder="123 Main Street"
                    className="h-9 text-sm"
                />
            </Field>

            <div className="grid grid-cols-2 gap-3">
                <Field label="City">
                    <Input {...register("city")} placeholder="Mumbai" className="h-9 text-sm" />
                </Field>
                <Field label="State">
                    <Input {...register("state")} placeholder="Maharashtra" className="h-9 text-sm" />
                </Field>
                <Field label="Country">
                    <Input {...register("country")} placeholder="India" className="h-9 text-sm" />
                </Field>
                <Field label="Pincode">
                    <Input {...register("pincode")} placeholder="400001" className="h-9 text-sm" />
                </Field>
            </div>

            {/* ── Notes ────────────────────────────────────────────── */}
            <SectionTitle>Internal notes</SectionTitle>

            <Field label="Notes (staff only)">
                <Textarea
                    {...register("notes")}
                    placeholder="Any notes visible only to staff…"
                    rows={3}
                    className="text-sm resize-none"
                />
            </Field>

            {/* ── Actions ──────────────────────────────────────────── */}
            <div className="flex gap-2 pt-2 border-t border-border">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={onCancel}
                    disabled={isPending}
                >
                    Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isPending}>
                    {isPending
                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
                        : submitLabel
                    }
                </Button>
            </div>
        </form>
    );
}