"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ShieldAlert, KeyRound, Eye, EyeOff } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

import { RoleBadge } from "./RoleBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

import {
    useUpdateStaff,
    useAdminResetPassword,
    useDeactivateStaff,
} from "@/hooks/staff/useStaff";
import { useAuthStore } from "@/stores/auth.store";
import type { Role, StaffUser } from "@/services/user.service";

// ─── Update form schema — mirrors controller: name, phone, role, isActive ──────
const updateSchema = z.object({
    name: z.string().trim().min(2, "At least 2 characters"),
    phone: z.string().trim().regex(/^\+?[0-9]{7,15}$/, "Invalid phone number")
        .optional().or(z.literal("")),
    role: z.string().min(1, "Select a role"),
    isActive: z.boolean(),
});

type UpdateFormValues = z.infer<typeof updateSchema>;

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

interface EditStaffDrawerProps {
    user: StaffUser | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    roles: Role[];
}

export function EditStaffDrawer({ user, open, onOpenChange, roles }: EditStaffDrawerProps) {
    const currentUserId = useAuthStore((s) => s.user?._id);

    // Is the admin editing their own account?
    const isSelf = currentUserId === user?._id;

    const updateMutation = useUpdateStaff(user?._id ?? "");
    const resetPwMutation = useAdminResetPassword(user?._id ?? "");
    const deactivateMutation = useDeactivateStaff();

    // Reset password state
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [confirmDeactivate, setConfirmDeactivate] = useState(false);

    const {
        register, handleSubmit, control, reset, watch, setValue,
        formState: { errors },
    } = useForm<UpdateFormValues>({ resolver: zodResolver(updateSchema) });

    // Populate form when drawer opens with a user
    useEffect(() => {
        if (!user) return;
        reset({
            name: user.name,
            phone: user.phone ?? "",
            role: user.role._id,
            isActive: user.isActive,
        });
        setNewPassword("");
    }, [user, reset]);

    const isActive = watch("isActive");

    const onSubmit = (values: UpdateFormValues) => {
        updateMutation.mutate(
            {
                name: values.name,
                phone: values.phone || undefined,
                role: values.role,
                isActive: values.isActive,
            },
            { onSuccess: () => onOpenChange(false) }
        );
    };

    const handleResetPassword = () => {
        if (newPassword.length < 8) return;
        // Controller: requires newPassword length >= 8
        resetPwMutation.mutate(
            { newPassword },
            { onSuccess: () => setNewPassword("") }
        );
    };

    const handleDeactivate = () => {
        if (!user) return;
        // Controller: guards against self-deactivation with 400 SELF_DEACTIVATION
        deactivateMutation.mutate(user._id, {
            onSuccess: () => {
                setConfirmDeactivate(false);
                onOpenChange(false);
            },
        });
    };

    if (!user) return null;

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="mb-5 pr-8">
                        {/* Avatar + name header */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                {user.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <DialogTitle className="text-base leading-tight">{user.name}</DialogTitle>
                                <DialogDescription className="text-xs mt-0.5">
                                    {user.email}
                                </DialogDescription>
                            </div>
                            <RoleBadge
                                name={user.role.name}
                                displayName={user.role.displayName}
                                className="ml-auto flex-shrink-0"
                            />
                        </div>
                    </DialogHeader>

                    {/* ── Update form ────────────────────────────────── */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

                        <Field label="Full name *" error={errors.name?.message}>
                            <Input {...register("name")} className={errors.name ? "border-destructive" : ""} />
                        </Field>

                        <Field label="Phone" error={errors.phone?.message}>
                            <Input {...register("phone")} type="tel" placeholder="+91 ..."
                                className={errors.phone ? "border-destructive" : ""} />
                        </Field>

                        <Field label="Role *" error={errors.role?.message}>
                            <Controller
                                name="role"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={isSelf}   // can't change your own role
                                    >
                                        <SelectTrigger className={errors.role ? "border-destructive" : ""}>
                                            <SelectValue />
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
                            {isSelf && (
                                <p className="text-xs text-muted-foreground">
                                    You cannot change your own role.
                                </p>
                            )}
                        </Field>

                        {/* isActive toggle — controller guards self-deactivation */}
                        <div className="flex items-center justify-between py-1">
                            <div>
                                <p className="text-sm font-medium">Active</p>
                                <p className="text-xs text-muted-foreground">
                                    {isSelf
                                        ? "You cannot deactivate your own account."
                                        : "Inactive users cannot log in."
                                    }
                                </p>
                            </div>
                            <Switch
                                checked={isActive}
                                onCheckedChange={(v) => setValue("isActive", v)}
                                disabled={isSelf}
                            />
                        </div>

                        <div className="flex gap-2 pt-1">
                            <Button type="button" variant="outline" className="flex-1"
                                onClick={() => onOpenChange(false)}
                                disabled={updateMutation.isPending}>
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1"
                                disabled={updateMutation.isPending}>
                                {updateMutation.isPending
                                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
                                    : "Save changes"
                                }
                            </Button>
                        </div>
                    </form>

                    {/* ── Admin reset password ───────────────────────── */}
                    <Separator className="my-5" />

                    <div className="space-y-3">
                        <p className="text-sm font-semibold flex items-center gap-1.5">
                            <KeyRound className="w-4 h-4 text-muted-foreground" />
                            Reset password
                        </p>
                        <p className="text-xs text-muted-foreground">
                            The user will be required to log in again after the reset.
                        </p>

                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="New password (min 8 characters)"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="pr-9"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword
                                        ? <EyeOff className="w-4 h-4" />
                                        : <Eye className="w-4 h-4" />
                                    }
                                </button>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleResetPassword}
                                disabled={newPassword.length < 8 || resetPwMutation.isPending}
                            >
                                {resetPwMutation.isPending
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : "Reset"
                                }
                            </Button>
                        </div>
                    </div>

                    {/* ── Danger zone — deactivate ───────────────────── */}
                    {/* Only shown for other users — controller guards self-deactivation */}
                    {!isSelf && user.isActive && (
                        <>
                            <Separator className="my-5" />
                            <div className="space-y-3">
                                <p className="text-sm font-semibold text-destructive flex items-center gap-1.5">
                                    <ShieldAlert className="w-4 h-4" />
                                    Danger zone
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Deactivating this account will immediately revoke all access.
                                    It can be restored later by editing the account.
                                </p>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    className="w-full"
                                    onClick={() => setConfirmDeactivate(true)}
                                >
                                    Deactivate account
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={confirmDeactivate}
                onOpenChange={setConfirmDeactivate}
                title="Deactivate account?"
                description={`${user.name} will immediately lose access to StayOS. You can restore it later by editing the account.`}
                confirmLabel="Deactivate"
                variant="destructive"
                isPending={deactivateMutation.isPending}
                onConfirm={handleDeactivate}
            />
        </>
    );
}