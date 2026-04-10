"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Hotel, Loader2 } from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/hooks/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClientError } from "@/services/api/client";

// ─── Validation schema (mirrors backend loginSchema) ─────────────────────────
const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ─────────────────────────────────────────────────────────────────────────────

export default function LoginPage() {
    const { login, isLoggingIn } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = (values: LoginFormValues) => {
        setServerError(null);

        login(values, {
            onError: (error) => {
                if (error instanceof ClientError) {
                    setServerError(error.message);
                } else {
                    setServerError("Something went wrong. Please try again.");
                }
            },
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">

            {/* Background subtle grid pattern */}
            <div
                className="pointer-events-none fixed inset-0 opacity-[0.03] dark:opacity-[0.05]"
                style={{
                    backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                                      linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                    backgroundSize: "40px 40px",
                }}
            />

            <div className="relative w-full max-w-[400px]">

                {/* Card */}
                <div className="bg-card border border-border rounded-xl shadow-sm p-8 space-y-6">

                    {/* Logo + branding */}
                    <div className="space-y-1 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                            <Hotel className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-xl font-semibold text-foreground tracking-tight">
                            Welcome back
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Sign in to StayOS
                        </p>
                    </div>

                    {/* Server error banner */}
                    {serverError && (
                        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3">
                            <p className="text-sm text-destructive font-medium">{serverError}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@hotel.com"
                                autoComplete="email"
                                autoFocus
                                disabled={isLoggingIn}
                                {...register("email")}
                                className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    disabled={isLoggingIn}
                                    {...register("password")}
                                    className={`pr-10 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword
                                        ? <EyeOff className="w-4 h-4" />
                                        : <Eye className="w-4 h-4" />
                                    }
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-destructive">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoggingIn}
                        >
                            {isLoggingIn
                                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in…</>
                                : "Sign in"
                            }
                        </Button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-muted-foreground mt-6">
                    StayOS · Property Management System
                </p>
            </div>
        </div>
    );
}