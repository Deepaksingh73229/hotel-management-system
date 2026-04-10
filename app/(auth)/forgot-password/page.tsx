"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Hotel, Loader2, MailCheck } from "lucide-react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { forgotPassword } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
    const [submitted, setSubmitted] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState("");

    const { register, handleSubmit, formState: { errors } } = useForm < FormValues > ({
        resolver: zodResolver(schema),
    });

    const mutation = useMutation({
        mutationFn: (values: FormValues) => forgotPassword(values),
        onSuccess: (_, variables) => {
            setSubmittedEmail(variables.email);
            setSubmitted(true);
        },
        onError: () => {
            // Always show success to avoid email enumeration
            toast.success("If that email exists, a reset link has been sent.");
            setSubmitted(true);
        },
    });

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background px-4">
                <div className="w-full max-w-[400px] bg-card border border-border rounded-xl shadow-sm p-8 space-y-4 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/10 mb-2">
                        <MailCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-lg font-semibold">Check your email</h1>
                    <p className="text-sm text-muted-foreground">
                        If <span className="font-medium text-foreground">{submittedEmail}</span> is
                        registered, you will receive a reset link shortly.
                    </p>
                    <Link href="/login">
                        <Button variant="outline" className="w-full mt-2">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to sign in
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-[400px]">
                <div className="bg-card border border-border rounded-xl shadow-sm p-8 space-y-6">
                    <div className="space-y-1 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                            <Hotel className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-xl font-semibold tracking-tight">Forgot password?</h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your email and we'll send a reset link.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4" noValidate>
                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@hotel.com"
                                autoFocus
                                disabled={mutation.isPending}
                                {...register("email")}
                                className={errors.email ? "border-destructive" : ""}
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive">{errors.email.message}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={mutation.isPending}>
                            {mutation.isPending
                                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</>
                                : "Send reset link"
                            }
                        </Button>
                    </form>

                    <div className="text-center">
                        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
                            <ArrowLeft className="w-3 h-3" /> Back to sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}