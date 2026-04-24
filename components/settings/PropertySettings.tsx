"use client";

import { useEffect, useState } from "react";
import { Loader2, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SettingsSection, FieldLabel } from "./SettingsShared";
import { useProperty, useCreateProperty, useUpdateProperty } from "@/hooks/settings/useSettings";
import type { CreatePropertyPayload } from "@/types";

const EMPTY: CreatePropertyPayload = {
    name: "", code: "", email: "", phone: "",
    city: "", country: "", timezone: "", currency: "",
};

export function PropertySettings() {
    const { data: property } = useProperty();
    const createMutation = useCreateProperty();
    const updateMutation = useUpdateProperty();
    const [form, setForm] = useState<CreatePropertyPayload>(EMPTY);

    useEffect(() => {
        if (!property) return;
        setForm({
            name: property.name ?? "",
            code: property.code ?? "",
            email: property.email ?? "",
            phone: property.phone ?? "",
            city: property.city ?? "",
            country: property.country ?? "",
            timezone: property.timezone ?? "",
            currency: property.currency ?? "",
        });
    }, [property]);

    const set = (key: keyof CreatePropertyPayload) =>
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((s) => ({ ...s, [key]: e.target.value }));

    const isPending = createMutation.isPending || updateMutation.isPending;

    const handleSave = () => {
        if (!form.name?.trim()) return;
        if (property?._id) { updateMutation.mutate(form); return; }
        createMutation.mutate(form);
    };

    return (
        <SettingsSection
            title="Property details"
            description="Basic information about your hotel property."
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                    { key: "name", label: "Property name", required: true },
                    { key: "code", label: "Property code" },
                    { key: "email", label: "Email" },
                    { key: "phone", label: "Phone" },
                    { key: "city", label: "City" },
                    { key: "country", label: "Country" },
                    { key: "timezone", label: "Timezone", placeholder: "Asia/Kolkata" },
                    { key: "currency", label: "Currency", placeholder: "INR" },
                ].map(({ key, label, required, placeholder }) => (
                    <div key={key}>
                        <FieldLabel required={required}>{label}</FieldLabel>
                        <Input
                            value={(form as any)[key] ?? ""}
                            onChange={set(key as keyof CreatePropertyPayload)}
                            placeholder={placeholder}
                            className="h-9 text-sm"
                        />
                    </div>
                ))}
            </div>

            <div className="flex justify-end pt-2">
                <Button onClick={handleSave} disabled={isPending} className="gap-2">
                    {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    <Building2 className="w-4 h-4" />
                    {property?._id ? "Save changes" : "Create property"}
                </Button>
            </div>
        </SettingsSection>
    );
}