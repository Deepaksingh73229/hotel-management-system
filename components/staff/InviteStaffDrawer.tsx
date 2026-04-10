"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCreateUser } from "@/hooks/staff/useUsers";
import { ClientError } from "@/services/api/client";

// ─── Password rules mirror the backend passwordSchema ─────────────────────────
const passwordSchema = z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/,       "Must contain an uppercase letter")
    .regex(/[a-z]/,       "Must contain a lowercase letter")
    .regex(/[0-9]/,       "Must contain a number")
    .regex(/[^A-Za-z0-9]/, "Must contain a special character");

const schema = z.object({
    name:     z.string().trim().min(2, "Name must be at least 2 characters"),
    email:    z.string().trim().toLowerCase().email("Enter a valid email"),
    phone:    z.string().trim().regex(/^\+?[0-9]{7,15}$/, "Invalid phone number").optional().or(z.literal("")),
    password: passwordSchema,
    role:     z.string().min(1, "Select a role"),
});

type FormValues = z.infer<typeof schema>;

// ─── Hardcoded role options ───────────────────────────────────────────────────
// In production you'd fetch these from GET /api/roles.
// For now these match exactly what your Role model seeds.
const ROLE_OPTIONS = [
    { value: "ADMIN_ROLE_ID",      label: "Admin" },
    { value: "FRONT_DESK_ROLE_ID", label: "Front Desk" },
];

interface InviteStaffDrawerProps {
    open:         boolean;
    onOpenChange: (open: boolean) => void;
    /** Pass actual role ObjectIds from your backend seed here. */
    roles:        { _id: string; name: string; displayName: string }[];
}

export function InviteStaffDrawer({ open, onOpenChange, roles }: InviteStaffDrawerProps) {
    const createUser = useCreateUser();

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
        setError,
    } = useForm<FormValues>({ resolver: zodResolver(schema) });

    const onSubmit = (values: FormValues) => {
        createUser.mutate(
            {
                name:     values.name,
                email:    values.email,
                phone:    values.phone || undefined,
                password: values.password,
                role:     values.role,
            },
            {
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
                onError: (err) => {
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
        <Sheet open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle>Invite staff member</SheetTitle>
                    <SheetDescription>
                        Create a new staff account. They can log in immediately.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

                    {/* Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Full name</Label>
                        <Input id="name" placeholder="Jane Smith" {...register("name")}
                            className={errors.name ? "border-destructive" : ""} />
                        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="jane@hotel.com" {...register("email")}
                            className={errors.email ? "border-destructive" : ""} />
                        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone <span className="text-muted-foreground">(optional)</span></Label>
                        <Input id="phone" type="tel" placeholder="+91 98765 43210" {...register("phone")}
                            className={errors.phone ? "border-destructive" : ""} />
                        {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                    </div>

                    {/* Role */}
                    <div className="space-y-1.5">
                        <Label>Role</Label>
                        <Select onValueChange={(v) => setValue("role", v)}>
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
                        {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="••••••••" {...register("password")}
                            className={errors.password ? "border-destructive" : ""} />
                        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                        <p className="text-xs text-muted-foreground">
                            Min 8 chars with uppercase, lowercase, number, and special character.
                        </p>
                    </div>

                    <SheetFooter className="pt-4 gap-2">
                        <Button type="button" variant="outline"
                            onClick={() => { reset(); onOpenChange(false); }}
                            disabled={createUser.isPending}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createUser.isPending}>
                            {createUser.isPending
                                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating…</>
                                : "Create account"
                            }
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}