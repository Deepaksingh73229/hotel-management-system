"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ShieldAlert } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useUpdateUser, useAdminResetPassword, useDeactivateUser } from "@/hooks/staff/useUsers";
import { useAuthStore } from "@/stores/auth.store";
import type { AuthUser } from "@/types";

const schema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    phone: z.string().trim().regex(/^\+?[0-9]{7,15}$/, "Invalid phone number").optional().or(z.literal("")),
    role: z.string().min(1, "Select a role"),
    isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface EditStaffDrawerProps {
    user: AuthUser | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    roles: { _id: string; name: string; displayName: string }[];
}

export function EditStaffDrawer({ user, open, onOpenChange, roles }: EditStaffDrawerProps) {
    const currentUser = useAuthStore((s) => s.user);
    const isSelf = currentUser?._id === user?._id;

    const updateUser = useUpdateUser(user?._id ?? "");
    const resetPassword = useAdminResetPassword(user?._id ?? "");
    const deactivateUser = useDeactivateUser();

    const [newPassword, setNewPassword] = useState("");
    const [confirmDeactivate, setConfirmDeactivate] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<FormValues>({ resolver: zodResolver(schema) });

    // Populate form when user changes.
    useEffect(() => {
        if (user) {
            reset({
                name: user.name,
                phone: user.phone ?? "",
                role: user.role._id,
                isActive: user.isActive,
            });
        }
    }, [user, reset]);

    const isActive = watch("isActive");

    const onSubmit = (values: FormValues) => {
        updateUser.mutate(
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
        if (!newPassword || newPassword.length < 8) return;
        resetPassword.mutate(
            { newPassword },
            { onSuccess: () => setNewPassword("") }
        );
    };

    const handleDeactivate = () => {
        if (!user) return;
        deactivateUser.mutate(user._id, {
            onSuccess: () => {
                setConfirmDeactivate(false);
                onOpenChange(false);
            },
        });
    };

    if (!user) return null;

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle>Edit staff member</SheetTitle>
                        <SheetDescription>{user.email}</SheetDescription>
                    </SheetHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

                        {/* Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-name">Full name</Label>
                            <Input id="edit-name" {...register("name")}
                                className={errors.name ? "border-destructive" : ""} />
                            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-phone">Phone <span className="text-muted-foreground">(optional)</span></Label>
                            <Input id="edit-phone" type="tel" {...register("phone")}
                                className={errors.phone ? "border-destructive" : ""} />
                            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                        </div>

                        {/* Role */}
                        <div className="space-y-1.5">
                            <Label>Role</Label>
                            <Select
                                defaultValue={user.role._id}
                                onValueChange={(v) => setValue("role", v)}
                                disabled={isSelf}
                            >
                                <SelectTrigger>
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
                            {isSelf && (
                                <p className="text-xs text-muted-foreground">You cannot change your own role.</p>
                            )}
                        </div>

                        {/* Active toggle */}
                        <div className="flex items-center justify-between py-1">
                            <div>
                                <p className="text-sm font-medium">Active</p>
                                <p className="text-xs text-muted-foreground">Inactive users cannot log in.</p>
                            </div>
                            <Switch
                                checked={isActive}
                                onCheckedChange={(v) => setValue("isActive", v)}
                                disabled={isSelf}
                            />
                        </div>

                        <SheetFooter className="pt-2 gap-2">
                            <Button type="button" variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={updateUser.isPending}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateUser.isPending}>
                                {updateUser.isPending
                                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
                                    : "Save changes"
                                }
                            </Button>
                        </SheetFooter>
                    </form>

                    {/* ── Admin: Reset password ────────────────────────── */}
                    <Separator className="my-6" />
                    <div className="space-y-3">
                        <p className="text-sm font-medium">Reset password</p>
                        <div className="flex gap-2">
                            <Input
                                type="password"
                                placeholder="New password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleResetPassword}
                                disabled={resetPassword.isPending || newPassword.length < 8}
                            >
                                {resetPassword.isPending
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : "Reset"
                                }
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
                    </div>

                    {/* ── Danger zone: Deactivate ──────────────────────── */}
                    {!isSelf && user.isActive && (
                        <>
                            <Separator className="my-6" />
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-destructive flex items-center gap-1.5">
                                    <ShieldAlert className="w-4 h-4" /> Danger zone
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
                </SheetContent>
            </Sheet>

            <ConfirmDialog
                open={confirmDeactivate}
                onOpenChange={setConfirmDeactivate}
                title="Deactivate account?"
                description={`${user.name} will immediately lose access to StayOS. This can be reversed by editing their account.`}
                confirmLabel="Deactivate"
                variant="destructive"
                isPending={deactivateUser.isPending}
                onConfirm={handleDeactivate}
            />
        </>
    );
}