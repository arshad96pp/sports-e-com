"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, ShieldAlert } from "lucide-react";
import { STORE } from "@/lib/config";
import { getAuthClientPort } from "@/lib/config/providers.client";
import { resetPasswordAction } from "@/lib/actions/auth-actions";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type ResetLinkReason = "missing" | "expired" | "invalid";

interface ResetPasswordClientProps {
  canReset: boolean;
  reason?: ResetLinkReason;
}

function StatusCard({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-signal-soft px-5 py-6 text-center">
      <ShieldAlert className="h-8 w-8 text-signal" />
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="text-sm text-muted">{body}</p>
      <Button asChild className="mt-2 h-10 w-full rounded-full text-sm font-bold">
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    </div>
  );
}

export function ResetPasswordClient({ canReset, reason }: ResetPasswordClientProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.has("token_hash") || params.has("token") || params.has("code")) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current) return;

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid password");
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await resetPasswordAction(parsed.data.password, parsed.data.confirmPassword);
      if (!result.ok) {
        setError(result.error ?? "Could not update your password. Please request a new reset link and try again.");
        return;
      }
      try {
        await getAuthClientPort().signOut();
      } catch {
        // Server already revoked the session; local sign-out is best-effort UI sync.
      }
      setDone(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  const invalidReason = reason ?? (canReset ? undefined : "missing");

  return (
    <div className="container-app flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl font-bold tracking-tight text-ink">{STORE.name}</span>
          <div className="mx-auto mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-surface">
            <KeyRound className="h-5 w-5 text-ink" />
          </div>
          <h1 className="mt-4 font-display text-xl font-bold text-ink">
            {done ? "Password updated" : canReset && !reason ? "Create a new password" : "Reset password"}
          </h1>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-success-soft px-5 py-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-success" />
            <p className="text-sm font-medium text-ink">Password updated successfully.</p>
            <Button asChild className="mt-2 h-10 w-full rounded-full text-sm font-bold">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        ) : invalidReason === "expired" ? (
          <StatusCard
            title="This reset link has expired."
            body="Request a new password reset link."
            actionHref="/forgot-password"
            actionLabel="Request new link"
          />
        ) : invalidReason === "invalid" ? (
          <StatusCard
            title="This reset link is no longer valid."
            body="Request a new link."
            actionHref="/forgot-password"
            actionLabel="Request a new link"
          />
        ) : invalidReason === "missing" ? (
          <StatusCard
            title="Invalid reset link."
            body="Request a new password reset link to continue."
            actionHref="/forgot-password"
            actionLabel="Request a new link"
          />
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div>
              <Label htmlFor="reset-password" className="mb-1.5 text-xs font-semibold text-ink-soft">
                New password
              </Label>
              <div className="relative">
                <Input
                  id="reset-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={isSubmitting}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-ink disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-muted-soft">At least 8 characters, with a letter and a number.</p>
            </div>
            <div>
              <Label htmlFor="reset-confirm" className="mb-1.5 text-xs font-semibold text-ink-soft">
                Confirm password
              </Label>
              <div className="relative">
                <Input
                  id="reset-confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  disabled={isSubmitting}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  disabled={isSubmitting}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  aria-pressed={showConfirmPassword}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-ink disabled:opacity-50"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="text-xs font-medium text-signal">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="mt-2 h-11 w-full rounded-full text-sm font-bold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
