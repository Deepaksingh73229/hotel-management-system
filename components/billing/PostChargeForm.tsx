"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, PlusCircle } from "lucide-react";

import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { usePostCharge }         from "@/hooks/billing/useBilling";
import { CHARGE_TYPE_LABELS, type ChargeType } from "@/types";

const schema = z.object({
    chargeType:  z.string().min(1, "Select charge type"),
    description: z.string().trim().min(1, "Description is required"),
    quantity:    z.coerce.number().min(1).default(1),
    unitPrice:   z.coerce.number().min(0.01, "Price must be greater than 0"),
});

type FormValues = z.infer<typeof schema>;

interface PostChargeFormProps {
    folioId: string;
}

export function PostChargeForm({ folioId }: PostChargeFormProps) {
    const postCharge = usePostCharge(folioId);

    const { register, handleSubmit, control, watch, reset, formState: { errors } } =
        useForm<FormValues>({ resolver: zodResolver(schema) });

    const qty   = watch("quantity")  ?? 1;
    const price = watch("unitPrice") ?? 0;
    const total = Number(qty) * Number(price);

    const onSubmit = (values: FormValues) => {
        postCharge.mutate(
            {
                chargeType:  values.chargeType as ChargeType,
                description: values.description,
                quantity:    values.quantity,
                unitPrice:   values.unitPrice,
            },
            { onSuccess: () => reset() }
        );
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="bg-card border border-border rounded-xl p-4 space-y-4">
                <p className="text-sm font-semibold flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-primary" />
                    Post a charge
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Charge type */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Charge type *</Label>
                        <Controller
                            name="chargeType"
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className={`h-9 text-sm ${errors.chargeType ? "border-destructive" : ""}`}>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(CHARGE_TYPE_LABELS).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.chargeType && (
                            <p className="text-xs text-destructive">{errors.chargeType.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Description *</Label>
                        <Input
                            placeholder="e.g. Dinner for 2"
                            {...register("description")}
                            className={`h-9 text-sm ${errors.description ? "border-destructive" : ""}`}
                        />
                        {errors.description && (
                            <p className="text-xs text-destructive">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Quantity */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Qty</Label>
                        <Input
                            type="number" min={1} defaultValue={1}
                            {...register("quantity")}
                            className="h-9 text-sm"
                        />
                    </div>

                    {/* Unit price */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Unit price (₹) *</Label>
                        <Input
                            type="number" min={0} step="0.01"
                            placeholder="0.00"
                            {...register("unitPrice")}
                            className={`h-9 text-sm ${errors.unitPrice ? "border-destructive" : ""}`}
                        />
                        {errors.unitPrice && (
                            <p className="text-xs text-destructive">{errors.unitPrice.message}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    {total > 0 && (
                        <p className="text-sm text-muted-foreground">
                            Total: <span className="font-semibold text-foreground">
                                ₹{total.toLocaleString("en-IN")}
                            </span>
                        </p>
                    )}
                    <Button
                        type="submit"
                        size="sm"
                        className="ml-auto"
                        disabled={postCharge.isPending}
                    >
                        {postCharge.isPending
                            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Posting…</>
                            : "Post charge"
                        }
                    </Button>
                </div>
            </div>
        </form>
    );
}