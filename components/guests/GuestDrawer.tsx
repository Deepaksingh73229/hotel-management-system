"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { GuestForm } from "./GuestForm";
import { useCreateGuest, useUpdateGuest } from "@/hooks/guests/useGuests";
import { ClientError } from "@/services/api/client";
import type { Guest, CreateGuestPayload } from "@/types";

interface GuestDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** If provided, drawer is in edit mode. Otherwise create mode. */
    guest?: Guest | null;
}

export function GuestDrawer({ open, onOpenChange, guest }: GuestDrawerProps) {
    const isEdit = !!guest;

    const createGuest = useCreateGuest();
    const updateGuest = useUpdateGuest(guest?._id ?? "");

    const mutation = isEdit ? updateGuest : createGuest;

    const handleSubmit = (payload: CreateGuestPayload) => {
        mutation.mutate(payload as any, {
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader className="mb-6 pr-8">
                    <DialogTitle>
                        {isEdit ? "Edit guest profile" : "Add new guest"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? `Editing profile for ${guest.firstName} ${guest.lastName}.`
                            : "Fill in the guest details to create a new profile."
                        }
                    </DialogDescription>
                </DialogHeader>

                <GuestForm
                    defaultValues={isEdit ? guest : null}
                    isPending={mutation.isPending}
                    onSubmit={handleSubmit}
                    onCancel={() => onOpenChange(false)}
                    submitLabel={isEdit ? "Save changes" : "Create guest"}
                />
            </DialogContent>
        </Dialog>
    );
}