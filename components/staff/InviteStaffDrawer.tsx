"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, UserPlus } from "lucide-react";

import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useRegisterStaff } from "@/hooks/staff/useStaff";
import { ClientError } from "@/services/api/client";
import type { Role } from "@/services/user.service";

// ─── Validation mirrors the backend auth.validators.js registerSchema ─────────
// Controller: name (min 2), email (email), phone (optional regex), password
//             (min 8, uppercase, lowercase, number, special char), role (ObjectId)

const passwordSchema = z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^A-Za-z0-9]/, "Must contain a special character");

const schema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    phone: z.string().trim().regex(/^\+?[0-9]{7,15}$/, "Invalid phone number")
        .optional().or(z.literal("")),
    password: passwordSchema,
    role: z.string().min(1, "Select a role"),          // must be a role ObjectId
});

type FormValues = z.infer<typeof schema>;

const Field = ({ label, error, children }: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) => (
    <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
        {children}
        {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
);

interface InviteStaffDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    roles: Role[];
}

export function InviteStaffDrawer({ open, onOpenChange, roles }: InviteStaffDrawerProps) {
    const registerMutation = useRegisterStaff();

    const {
        register, handleSubmit, control, reset, setError,
        formState: { errors },
    } = useForm<FormValues>({ resolver: zodResolver(schema) });

    const handleClose = () => { reset(); onOpenChange(false); };

    const onSubmit = (values: FormValues) => {
        registerMutation.mutate(
            {
                name: values.name,
                email: values.email,
                phone: values.phone || undefined,
                password: values.password,
                role: values.role,     // ObjectId — required by controller
            },
            {
                onSuccess: () => handleClose(),

                onError: (err) => {
                    // Surface field-level validation errors from backend (422)
                    if (err instanceof ClientError && err.errors) {
                        err.errors.forEach((e) => {
                            setError(e.field as keyof FormValues, { message: e.message });
                        });
                    }
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
            <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader className="mb-6 pr-8">
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Invite staff member
                    </DialogTitle>
                    <DialogDescription>
                        Create a new staff account. They can log in immediately with the password you set.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

                    <Field label="Full name *" error={errors.name?.message}>
                        <Input
                            placeholder="Jane Smith"
                            {...register("name")}
                            className={errors.name ? "border-destructive" : ""}
                        />
                    </Field>

                    <Field label="Email *" error={errors.email?.message}>
                        <Input
                            type="email"
                            placeholder="jane@hotel.com"
                            autoComplete="off"
                            {...register("email")}
                            className={errors.email ? "border-destructive" : ""}
                        />
                    </Field>

                    <Field label="Phone (optional)" error={errors.phone?.message}>
                        <Input
                            type="tel"
                            placeholder="+91 98765 43210"
                            {...register("phone")}
                            className={errors.phone ? "border-destructive" : ""}
                        />
                    </Field>

                    <Field label="Role *" error={errors.role?.message}>
                        <Controller
                            name="role"
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className={errors.role ? "border-destructive" : ""}>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((r) => (
                                            <SelectItem key={r._id} value={r._id}>
                                                {r.displayName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </Field>

                    <Field label="Password *" error={errors.password?.message}>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            {...register("password")}
                            className={errors.password ? "border-destructive" : ""}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Min 8 characters · uppercase · lowercase · number · special character
                        </p>
                    </Field>

                    <DialogFooter className="gap-2 pt-2">
                        <Button
                            type="button" variant="outline"
                            onClick={handleClose}
                            disabled={registerMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={registerMutation.isPending}>
                            {registerMutation.isPending
                                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating…</>
                                : "Create account"
                            }
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}