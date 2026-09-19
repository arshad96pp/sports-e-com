"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, ShieldAlert } from "lucide-react";
import { STORE } from "@/lib/config";
import { useSupabaseSession } from "@/lib/context/SupabaseSessionContext";
import { getAuthClientPort } from "@/lib/config/providers.client";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordClient() {
  const router = useRouter();
  // The reset-password link lands here with a Supabase recovery session
  // already established (the browser client exchanges the `?code=` in the
  // URL for a session on load) — `status` tells us whether that succeeded.
  const { status } = useSupabaseSession();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => router.replace("/login"), 2500);
    return () => clearTimeout(timer);
  }, [done, router]);

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
      const { error } = await getAuthClientPort().updatePassword(parsed.data.password);
      if (error) {
        setError("Could not update your password. Please request a new reset link and try again.");
        return;
      }
      await getAuthClientPort().signOut();
      setDone(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container-app flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl font-bold tracking-tight text-ink">{STORE.name}</span>
          <div className="mx-auto mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-surface">
            <KeyRound className="h-5 w-5 text-ink" />
          </div>
          <h1 className="mt-4 font-display text-xl font-bold text-ink">Set a new password</h1>
        </div>

        {status === "loading" && !done && (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted" />
          </div>
        )}

        {status === "unauthenticated" && !done && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-signal-soft px-5 py-6 text-center">
            <ShieldAlert className="h-8 w-8 text-signal" />
            <p className="text-sm font-medium text-ink">
              This password reset link is invalid or has expired. Request a new one to continue.
            </p>
            <Button asChild className="mt-2 h-10 w-full rounded-full text-sm font-bold">
              <Link href="/forgot-password">Request a new link</Link>
            </Button>
          </div>
        )}

        {status === "authenticated" && !done && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div>
              <Label htmlFor="reset-password" className="mb-1.5 text-xs font-semibold text-ink-soft">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="reset-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-ink"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-muted-soft">At least 8 characters, with a letter and a number.</p>
            </div>
            <div>
              <Label htmlFor="reset-confirm" className="mb-1.5 text-xs font-semibold text-ink-soft">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="reset-confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  aria-pressed={showConfirmPassword}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-ink"
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

            <Button type="submit" disabled={isSubmitting} className="mt-2 h-11 w-full rounded-full text-sm font-bold">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        )}

        {done && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-success-soft px-5 py-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-success" />
            <p className="text-sm font-medium text-ink">Password updated. Redirecting you to login…</p>
          </div>
        )}
      </div>
    </div>
  );
}
