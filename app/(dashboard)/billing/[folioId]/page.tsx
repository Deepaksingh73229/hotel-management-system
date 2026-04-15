"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileCheck2, Loader2, Receipt } from "lucide-react";
import { format } from "date-fns";

import { Button }               from "@/components/ui/button";
import { Skeleton }             from "@/components/ui/skeleton";
import { Separator }            from "@/components/ui/separator";
import { Input }                from "@/components/ui/input";
import { Label }                from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

import { ChargesLedger }        from "@/components/billing/ChargesLedger";
import { PaymentsLedger }       from "@/components/billing/PaymentsLedger";
import { PostChargeForm }       from "@/components/billing/PostChargeForm";
import { AddPaymentForm }       from "@/components/billing/AddPaymentForm";
import { FolioSummaryFooter }   from "@/components/billing/FolioSummaryFooter";
import { StatusBadge }          from "@/components/common/StatusBadge";

import { useFolio, useInvoice, useGenerateInvoice } from "@/hooks/billing/useBilling";
import { guestFullName }        from "@/types";

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {children}
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────

export default function FolioDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id     = params.folioId as string;

    const { data, isLoading }  = useFolio(id);
    const { data: invoice }    = useInvoice(id);
    const generateInvoice      = useGenerateInvoice(id);

    const [invoiceOpen,     setInvoiceOpen]     = useState(false);
    const [billingName,     setBillingName]     = useState("");
    const [billingAddress,  setBillingAddress]  = useState("");
    const [gstNumber,       setGstNumber]       = useState("");

    if (isLoading) {
        return (
            <div className="p-6 space-y-5 max-w-5xl">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-6 text-sm text-muted-foreground">
                Folio not found.{" "}
                <button onClick={() => router.back()} className="underline">Go back</button>
            </div>
        );
    }

    const { folio, charges, payments } = data;
    const isOpen    = folio.status === "open";
    const guestName = guestFullName(folio.guest);

    const handleGenerateInvoice = () => {
        generateInvoice.mutate(
            {
                billingName:    billingName || guestName,
                billingAddress: billingAddress || undefined,
                gstNumber:      gstNumber      || undefined,
            },
            { onSuccess: () => setInvoiceOpen(false) }
        );
    };

    return (
        <div className="p-6 space-y-6 max-w-5xl">

            {/* Back */}
            <Button
                variant="ghost" size="sm"
                onClick={() => router.push("/billing")}
                className="-ml-2 text-muted-foreground"
            >
                <ArrowLeft className="w-4 h-4 mr-1" /> Billing
            </Button>

            {/* Header */}
            <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-base font-semibold text-foreground">
                                {folio.folioNumber}
                            </span>
                            <StatusBadge
                                label={folio.status.charAt(0).toUpperCase() + folio.status.slice(1)}
                                variant={folio.status === "open" ? "green" : folio.status === "settled" ? "gray" : "red"}
                                dot={folio.status === "open"}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">{guestName}</p>
                        <p className="text-xs text-muted-foreground">
                            Created {format(new Date(folio.createdAt), "dd MMM yyyy, HH:mm")}
                            {folio.settledAt && (
                                <> · Settled {format(new Date(folio.settledAt), "dd MMM yyyy, HH:mm")}</>
                            )}
                        </p>
                    </div>

                    {/* Invoice actions */}
                    <div className="flex gap-2">
                        {invoice ? (
                            <Button variant="outline" size="sm" className="gap-1.5">
                                <Receipt className="w-4 h-4" />
                                View invoice {invoice.invoiceNumber}
                            </Button>
                        ) : (
                            isOpen && (
                                <Button
                                    variant="outline" size="sm"
                                    className="gap-1.5"
                                    onClick={() => {
                                        setBillingName(guestName);
                                        setInvoiceOpen(true);
                                    }}
                                >
                                    <FileCheck2 className="w-4 h-4" />
                                    Generate invoice
                                </Button>
                            )
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── Left: ledgers + forms ─────────────────────────── */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Charges */}
                    <Section title="Charges">
                        <ChargesLedger
                            charges={charges}
                            folioId={id}
                            canVoid={isOpen}
                        />
                    </Section>

                    {isOpen && <PostChargeForm folioId={id} />}

                    <Separator />

                    {/* Payments */}
                    <Section title="Payments">
                        <PaymentsLedger payments={payments} />
                    </Section>

                    {isOpen && (
                        <AddPaymentForm folioId={id} balance={folio.balance} />
                    )}
                </div>

                {/* ── Right: summary ────────────────────────────────── */}
                <div className="space-y-4">
                    <Section title="Summary">
                        <FolioSummaryFooter folio={folio} />
                    </Section>

                    {folio.notes && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/40 rounded-xl p-4">
                            <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 mb-1">
                                Notes
                            </p>
                            <p className="text-sm text-foreground">{folio.notes}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Generate invoice dialog */}
            <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Generate invoice</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Billing name *</Label>
                            <Input
                                value={billingName}
                                onChange={(e) => setBillingName(e.target.value)}
                                placeholder="Guest or company name"
                                className="h-9 text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Billing address</Label>
                            <Input
                                value={billingAddress}
                                onChange={(e) => setBillingAddress(e.target.value)}
                                placeholder="Full address (optional)"
                                className="h-9 text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">GST number</Label>
                            <Input
                                value={gstNumber}
                                onChange={(e) => setGstNumber(e.target.value)}
                                placeholder="GSTIN (optional)"
                                className="h-9 text-sm"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setInvoiceOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            disabled={!billingName || generateInvoice.isPending}
                            onClick={handleGenerateInvoice}
                        >
                            {generateInvoice.isPending
                                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</>
                                : "Generate"
                            }
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}