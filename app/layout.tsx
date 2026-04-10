import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
    title: "StayOS — Hotel Management",
    description: "Property management system for modern hotels",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.variable}>
                {/*
                    Provider order matters:
                    1. ThemeProvider  — must be outermost for SSR flash prevention
                    2. QueryProvider  — TanStack Query must wrap everything that fetches
                    3. AuthProvider   — registers client callbacks + hydrates user
                    4. Toaster        — global toast notifications
                */}
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <QueryProvider>
                        <AuthProvider>
                            {children}
                        </AuthProvider>
                    </QueryProvider>

                    <Toaster
                        position="bottom-right"
                        richColors
                        closeButton
                        duration={4000}
                    />
                </ThemeProvider>
            </body>
        </html>
    );
}