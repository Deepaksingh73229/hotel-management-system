"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, isHydrating } = useAuthStore();

    useEffect(() => {
        // Wait until AuthProvider finishes the getMe call before redirecting.
        // Without this, a page refresh would flash the login screen briefly.
        if (!isHydrating && isAuthenticated) {
            router.replace("/dashboard");
        }
    }, [isAuthenticated, isHydrating, router]);

    // While hydrating, render nothing to prevent flash.
    if (isHydrating) return null;

    // If authenticated, render nothing while redirect happens.
    if (isAuthenticated) return null;

    return <>{children}</>;
}