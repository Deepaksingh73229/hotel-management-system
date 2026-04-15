"use client";

import { useState } from "react";
import { CalendarDays, BedDouble } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SettingsSection, FieldLabel } from "./SettingsShared";
import { useAvailability } from "@/hooks/rooms/useRooms";

export function AvailabilityChecker() {
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [adults, setAdults] = useState("2");
    const [children, setChildren] = useState("0");
    const [run, setRun] = useState(false);

    const enabled = run && checkIn.length > 0 && checkOut.length > 0;

    const { data, isFetching } = useAvailability(
        { checkIn, checkOut, adults: Number(adults) || undefined, children: Number(children) || undefined },
        enabled
    );

    return (
        <SettingsSection
            title="Check availability"
            description="See how many rooms are available across each room type for a given date range."
        >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                    <FieldLabel required>Check-in</FieldLabel>
                    <Input type="date" value={checkIn} onChange={(e) => { setCheckIn(e.target.value); setRun(false); }} className="h-9 text-sm" />
                </div>
                <div>
                    <FieldLabel required>Check-out</FieldLabel>
                    <Input type="date" value={checkOut} min={checkIn} onChange={(e) => { setCheckOut(e.target.value); setRun(false); }} className="h-9 text-sm" />
                </div>
                <div>
                    <FieldLabel>Adults</FieldLabel>
                    <Input type="number" min={1} value={adults} onChange={(e) => setAdults(e.target.value)} className="h-9 text-sm" />
                </div>
                <div>
                    <FieldLabel>Children</FieldLabel>
                    <Input type="number" min={0} value={children} onChange={(e) => setChildren(e.target.value)} className="h-9 text-sm" />
                </div>
            </div>

            <Button
                onClick={() => setRun(true)}
                disabled={!checkIn || !checkOut || isFetching}
                className="gap-1.5"
            >
                <CalendarDays className="w-4 h-4" />
                {isFetching ? "Checking…" : "Check availability"}
            </Button>

            {/* Results */}
            {data && (
                <div className="space-y-3 pt-1">
                    <p className="text-xs text-muted-foreground font-medium">
                        {data.nights} night{data.nights !== 1 ? "s" : ""} · {checkIn} → {checkOut}
                    </p>

                    {data.availability.length === 0 && (
                        <p className="text-sm text-muted-foreground">No room types configured.</p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {data.availability.map((item) => {
                            const isAvailable = item.availableRooms > 0;
                            return (
                                <div
                                    key={item.roomType._id}
                                    className={`border rounded-xl p-4 space-y-2 ${isAvailable
                                            ? "border-green-200 dark:border-green-800/40 bg-green-50 dark:bg-green-900/10"
                                            : "border-border bg-muted/30"
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <BedDouble className={`w-4 h-4 ${isAvailable ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`} />
                                        <p className="text-sm font-medium text-foreground">
                                            {item.roomType.name}
                                        </p>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-2xl font-bold ${isAvailable ? "text-green-700 dark:text-green-400" : "text-muted-foreground"}`}>
                                            {item.availableRooms}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            / {item.totalRooms} available
                                        </span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${isAvailable ? "bg-green-500" : "bg-muted-foreground/30"}`}
                                            style={{ width: `${item.totalRooms > 0 ? (item.availableRooms / item.totalRooms) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </SettingsSection>
    );
}