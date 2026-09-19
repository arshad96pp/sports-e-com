"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, KeyRound } from "lucide-react";
import { STORE } from "@/lib/config";
import { forgotPasswordAction } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const result = await forgotPasswordAction(email);
        if (!result.ok) {
          setError(result.error ?? "Enter a valid email");
          return;
        }
        setSent(true);
      } catch {
        setError("Network error. Please check your connection and try again.");
      }
    });
  }

  return (
    <div className="container-app flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl font-bold tracking-tight text-ink">{STORE.name}</span>
          <div className="mx-auto mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-surface">
            <KeyRound className="h-5 w-5 text-ink" />
          </div>
          <h1 className="mt-4 font-display text-xl font-bold text-ink">Reset your password</h1>
          <p className="mt-1 text-sm text-muted">
            Enter the email linked to your account and we&apos;ll send you a reset link.
          </p>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-success-soft px-5 py-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-success" />
            <p className="text-sm font-medium text-ink">
              If an account exists for <strong>{email}</strong>, a reset link is on its way.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="forgot-email" className="mb-1.5 text-xs font-semibold text-ink-soft">
                Email
              </Label>
              <Input
                id="forgot-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11"
              />
            </div>

            {error && (
              <p role="alert" className="text-xs font-medium text-signal">
                {error}
              </p>
            )}

            <Button type="submit" disabled={isPending} className="mt-2 h-11 w-full rounded-full text-sm font-bold">
              {isPending ? "Sending…" : "Send Reset Link"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          Remembered your password?{" "}
          <Link href="/login" className="font-semibold text-ink hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
