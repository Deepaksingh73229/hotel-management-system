"use client";

import { FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FolioTable } from "@/components/billing/FolioTable";
import { useFolios }  from "@/hooks/billing/useBilling";

const StatCard = ({ icon: Icon, label, value, color }: {
    icon: React.ElementType; label: string; value: number; color: string;
}) => (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-4 h-4" />
        </div>
        <div>
            <p className="text-xl font-semibold text-foreground leading-tight">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    </div>
);

export default function BillingPage() {
    const { data: openData }    = useFolios({ status: "open",    limit: 1 });
    const { data: settledData } = useFolios({ status: "settled", limit: 1 });

    return (
        <div className="p-6 space-y-6 max-w-7xl">
            <PageHeader
                title="Billing"
                subtitle="Manage folios, post charges, record payments, and generate invoices."
            />

            {/* Stat strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatCard
                    icon={AlertCircle}
                    label="Open folios"
                    value={openData?.pagination.total ?? 0}
                    color="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                />
                <StatCard
                    icon={CheckCircle2}
                    label="Settled folios"
                    value={settledData?.pagination.total ?? 0}
                    color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                />
                <StatCard
                    icon={FileText}
                    label="Total folios"
                    value={(openData?.pagination.total ?? 0) + (settledData?.pagination.total ?? 0)}
                    color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                />
            </div>

            <FolioTable />
        </div>
    );
}