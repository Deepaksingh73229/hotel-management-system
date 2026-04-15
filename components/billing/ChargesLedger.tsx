"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button }        from "@/components/ui/button";
import { Input }         from "@/components/ui/input";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useVoidCharge } from "@/hooks/billing/useBilling";
import { CHARGE_TYPE_LABELS, type FolioCharge } from "@/types";
import { cn } from "@/lib/utils";

interface ChargesLedgerProps {
    charges:  FolioCharge[];
    folioId:  string;
    canVoid:  boolean;
}

export function ChargesLedger({ charges, folioId, canVoid }: ChargesLedgerProps) {
    const [voidTarget, setVoidTarget] = useState<FolioCharge | null>(null);
    const [voidReason, setVoidReason] = useState("");
    const voidCharge = useVoidCharge(folioId);

    const handleVoid = () => {
        if (!voidTarget) return;
        voidCharge.mutate(
            { chargeId: voidTarget._id, payload: { reason: voidReason } },
            { onSuccess: () => { setVoidTarget(null); setVoidReason(""); } }
        );
    };

    return (
        <>
            <div className="border border-border rounded-xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Unit price</TableHead>
                            <TableHead className="text-right">Tax</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            {canVoid && <TableHead className="w-10" />}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {charges.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={canVoid ? 8 : 7}
                                    className="text-center text-sm text-muted-foreground py-8"
                                >
                                    No charges posted yet.
                                </TableCell>
                            </TableRow>
                        )}
                        {charges.map((charge) => (
                            <TableRow
                                key={charge._id}
                                className={cn(charge.isVoided && "opacity-40")}
                            >
                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                    {format(new Date(charge.chargeDate), "dd MMM, HH:mm")}
                                </TableCell>
                                <TableCell className="text-sm">
                                    <span className={cn(charge.isVoided && "line-through")}>
                                        {charge.description}
                                    </span>
                                    {charge.isVoided && (
                                        <span className="ml-2 text-xs text-red-500">VOID</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {CHARGE_TYPE_LABELS[charge.chargeType]}
                                </TableCell>
                                <TableCell className="text-sm text-right">
                                    {charge.quantity}
                                </TableCell>
                                <TableCell className="text-sm text-right">
                                    ₹{charge.unitPrice.toLocaleString("en-IN")}
                                </TableCell>
                                <TableCell className="text-sm text-right text-muted-foreground">
                                    ₹{charge.taxTotal.toLocaleString("en-IN")}
                                </TableCell>
                                <TableCell className="text-sm font-medium text-right">
                                    ₹{charge.totalWithTax.toLocaleString("en-IN")}
                                </TableCell>
                                {canVoid && (
                                    <TableCell>
                                        {!charge.isVoided && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                onClick={() => setVoidTarget(charge)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        )}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Void confirm */}
            <ConfirmDialog
                open={!!voidTarget}
                onOpenChange={(open) => { if (!open) { setVoidTarget(null); setVoidReason(""); } }}
                title="Void this charge?"
                description={`"${voidTarget?.description}" — ₹${voidTarget?.totalWithTax.toLocaleString("en-IN")} will be reversed.`}
                confirmLabel="Void charge"
                variant="destructive"
                isPending={voidCharge.isPending}
                onConfirm={handleVoid}
            >
                <div className="pt-2">
                    <Input
                        placeholder="Void reason (required)"
                        value={voidReason}
                        onChange={(e) => setVoidReason(e.target.value)}
                        className="text-sm"
                    />
                </div>
            </ConfirmDialog>
        </>
    );
}