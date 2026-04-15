import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="p-6 space-y-6">

            {/* Page header skeleton */}
            <div className="space-y-1.5">
                <Skeleton className="h-5 w-40 rounded" />
                <Skeleton className="h-3.5 w-64 rounded" />
            </div>

            {/* KPI strip skeleton */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-card border border-border rounded-xl p-5 flex items-center gap-4"
                    >
                        <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-3 w-24 rounded" />
                            <Skeleton className="h-6 w-16 rounded" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Content area skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
                <div>
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}