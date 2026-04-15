"use client";

import { format } from "date-fns";
import { Banknote, CreditCard, Smartphone, Building2, Award, HelpCircle } from "lucide-react";

import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { PAYMENT_MODE_LABELS, type Payment, type PaymentMode } from "@/types";

// ─── Mode icon ────────────────────────────────────────────────────────────────
const MODE_ICONS: Record<PaymentMode, React.ElementType> = {
    cash:             Banknote,
    credit_card:      CreditCard,
    debit_card:       CreditCard,
    upi:              Smartphone,
    bank_transfer:    Building2,
    corporate_credit: Building2,
    loyalty_points:   Award,
    other:            HelpCircle,
};

interface PaymentsLedgerProps {
    payments: Payment[];
}

export function PaymentsLedger({ payments }: PaymentsLedgerProps) {
    return (
        <div className="border border-border rounded-xl overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead>Date</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Received by</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {payments.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={6}
                                className="text-center text-sm text-muted-foreground py-8"
                            >
                                No payments recorded yet.
                            </TableCell>
                        </TableRow>
                    )}

                    {payments.map((payment) => {
                        const Icon = MODE_ICONS[payment.paymentMode] ?? HelpCircle;
                        const isRefund = payment.isRefund || payment.paymentType === "refund";

                        return (
                            <TableRow
                                key={payment._id}
                                className={cn(payment.isVoided && "opacity-40")}
                            >
                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                    {format(new Date(payment.paymentDate ?? payment.createdAt), "dd MMM, HH:mm")}
                                </TableCell>

                                <TableCell>
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                                        {PAYMENT_MODE_LABELS[payment.paymentMode]}
                                        {payment.cardLastFour && (
                                            <span className="text-xs text-muted-foreground">
                                                ···{payment.cardLastFour}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>

                                <TableCell className="text-xs text-muted-foreground">
                                    {payment.paymentType.replace(/_/g, " ")}
                                    {payment.isVoided && (
                                        <span className="ml-1 text-red-500">· VOID</span>
                                    )}
                                </TableCell>

                                <TableCell className="text-xs text-muted-foreground font-mono">
                                    {payment.transactionRef ?? payment.upiId ?? "—"}
                                </TableCell>

                                <TableCell className="text-xs text-muted-foreground">
                                    {payment.receivedBy?.name ?? "—"}
                                </TableCell>

                                <TableCell className={cn(
                                    "text-sm font-semibold text-right whitespace-nowrap",
                                    isRefund
                                        ? "text-red-600 dark:text-red-400"
                                        : "text-green-700 dark:text-green-400"
                                )}>
                                    {isRefund ? "-" : "+"}₹{payment.amount.toLocaleString("en-IN")}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}