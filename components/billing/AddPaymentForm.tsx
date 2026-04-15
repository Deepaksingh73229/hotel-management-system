"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Banknote } from "lucide-react";

import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAddPayment }              from "@/hooks/billing/useBilling";
import { PAYMENT_MODE_LABELS, type PaymentMode, type PaymentType } from "@/types";

const schema = z.object({
    amount:         z.coerce.number().min(0.01, "Amount must be greater than 0"),
    paymentMode:    z.string().min(1, "Select payment mode"),
    paymentType:    z.string().min(1, "Select payment type"),
    transactionRef: z.string().optional(),
    upiId:          z.string().optional(),
    cardLastFour:   z.string().max(4).optional(),
    notes:          z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const PAYMENT_TYPES: { value: PaymentType; label: string }[] = [
    { value: "deposit",          label: "Deposit" },
    { value: "partial",          label: "Partial payment" },
    { value: "full_settlement",  label: "Full settlement" },
    { value: "refund",           label: "Refund" },
    { value: "adjustment",       label: "Adjustment" },
];

interface AddPaymentFormProps {
    folioId:    string;
    balance:    number;
}

export function AddPaymentForm({ folioId, balance }: AddPaymentFormProps) {
    const addPayment = useAddPayment(folioId);

    const { register, handleSubmit, control, watch, reset, setValue, formState: { errors } } =
        useForm<FormValues>({ resolver: zodResolver(schema) });

    const mode = watch("paymentMode");

    const onSubmit = (values: FormValues) => {
        addPayment.mutate(
            {
                amount:         values.amount,
                paymentMode:    values.paymentMode as PaymentMode,
                paymentType:    values.paymentType as PaymentType,
                transactionRef: values.transactionRef || undefined,
                upiId:          values.upiId          || undefined,
                cardLastFour:   values.cardLastFour   || undefined,
                notes:          values.notes          || undefined,
            },
            { onSuccess: () => reset() }
        );
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="bg-card border border-border rounded-xl p-4 space-y-4">
                <p className="text-sm font-semibold flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-green-600 dark:text-green-400" />
                    Add payment
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Amount */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs text-muted-foreground">Amount (₹) *</Label>
                            {balance > 0 && (
                                <button
                                    type="button"
                                    className="text-xs text-primary hover:underline"
                                    onClick={() => setValue("amount", balance)}
                                >
                                    Use balance ₹{balance.toLocaleString("en-IN")}
                                </button>
                            )}
                        </div>
                        <Input
                            type="number" min={0} step="0.01"
                            placeholder="0.00"
                            {...register("amount")}
                            className={`h-9 text-sm ${errors.amount ? "border-destructive" : ""}`}
                        />
                        {errors.amount && (
                            <p className="text-xs text-destructive">{errors.amount.message}</p>
                        )}
                    </div>

                    {/* Payment mode */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Payment mode *</Label>
                        <Controller
                            name="paymentMode"
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className={`h-9 text-sm ${errors.paymentMode ? "border-destructive" : ""}`}>
                                        <SelectValue placeholder="Select mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(PAYMENT_MODE_LABELS).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    {/* Payment type */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Payment type *</Label>
                        <Controller
                            name="paymentType"
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className="h-9 text-sm">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PAYMENT_TYPES.map((t) => (
                                            <SelectItem key={t.value} value={t.value}>
                                                {t.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    {/* Conditional reference fields */}
                    {mode === "upi" && (
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">UPI ID / Ref</Label>
                            <Input placeholder="UPI reference" {...register("upiId")} className="h-9 text-sm" />
                        </div>
                    )}

                    {(mode === "credit_card" || mode === "debit_card") && (
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Last 4 digits</Label>
                            <Input
                                maxLength={4} placeholder="XXXX"
                                {...register("cardLastFour")}
                                className="h-9 text-sm"
                            />
                        </div>
                    )}

                    {(mode === "bank_transfer" || mode === "other") && (
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Transaction ref</Label>
                            <Input
                                placeholder="Ref / UTR number"
                                {...register("transactionRef")}
                                className="h-9 text-sm"
                            />
                        </div>
                    )}
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Notes (optional)</Label>
                    <Textarea
                        placeholder="Any additional notes…"
                        rows={2}
                        {...register("notes")}
                        className="text-sm resize-none"
                    />
                </div>

                <div className="flex justify-end">
                    <Button type="submit" size="sm" disabled={addPayment.isPending}>
                        {addPayment.isPending
                            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Recording…</>
                            : "Record payment"
                        }
                    </Button>
                </div>
            </div>
        </form>
    );
}