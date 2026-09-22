"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { useToast } from "@/lib/context/ToastContext";
import { useTransitionNavigation } from "@/lib/hooks/useTransitionNavigation";
import { getAuthClientPort } from "@/lib/config/providers.client";
import { registerSchema } from "@/lib/validations/auth";
import { AccountSkeleton } from "@/components/account/AccountSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterPageClient() {
  const { showToast } = useToast();
  const { isNavigating, replace } = useTransitionNavigation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkEmailFor, setCheckEmailFor] = useState<string | null>(null);
  // See LoginPageClient: a ref guard closes the race that a state-only
  // check leaves open when clicks fire faster than a React re-render.
  const submittingRef = useRef(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current) return;
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const parsed = registerSchema.safeParse({ fullName, email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid details");
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setError(null);

    try {
      const { needsEmailConfirmation, error } = await getAuthClientPort().signUp(parsed.data.email, parsed.data.password, {
        fullName: parsed.data.fullName,
      });
      if (error) {
        setError(
          error.message.toLowerCase().includes("already registered") || error.code === "user_already_exists"
            ? "An account with this email already exists."
            : error.message
        );
        submittingRef.current = false;
        setIsSubmitting(false);
        return;
      }

      fetch("/api/auth/welcome-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: parsed.data.fullName, email: parsed.data.email }),
      }).catch(() => {});

      if (needsEmailConfirmation) {
        // Different screen (check-email), not the form — safe to unlock.
        submittingRef.current = false;
        setIsSubmitting(false);
        setCheckEmailFor(parsed.data.email);
        return;
      }

      showToast(`Account created. Welcome, ${parsed.data.fullName.split(" ")[0]}!`, "success");
      replace("/account");
    } catch {
      setError("Network error. Please check your connection and try again.");
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }
  
  if (isNavigating) {
    return <AccountSkeleton />;
  }

  if (checkEmailFor) {
    return (
      <div className="container-app flex min-h-[70vh] items-center justify-center py-12">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-surface">
            <MailCheck className="h-5 w-5 text-ink" />
          </div>
          <h1 className="mt-4 font-display text-xl font-bold text-ink">Check your email</h1>
          <p className="mt-2 text-sm text-muted">
            We&apos;ve sent a verification link to <strong className="text-ink">{checkEmailFor}</strong>. Click it to
            activate your account, then log in.
          </p>
          <Button asChild className="mt-6 h-11 w-full rounded-full text-sm font-bold">
            <Link href="/login">Back to login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="mt-4 font-display text-xl font-bold text-ink">Create your account</h1>
          <p className="mt-1 text-sm text-muted">Join to save your favourites and addresses</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div>
            <Label htmlFor="reg-name" className="mb-1.5 text-xs font-semibold text-ink-soft">
              Full Name
            </Label>
            <Input
              id="reg-name"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="h-11"
            />
          </div>
          <div>
            <Label htmlFor="reg-email" className="mb-1.5 text-xs font-semibold text-ink-soft">
              Email
            </Label>
            <Input
              id="reg-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11"
            />
          </div>
          <div>
            <Label htmlFor="reg-password" className="mb-1.5 text-xs font-semibold text-ink-soft">
              Password
            </Label>
            <div className="relative">
              <Input
                id="reg-password"
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
            <Label htmlFor="reg-confirm" className="mb-1.5 text-xs font-semibold text-ink-soft">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="reg-confirm"
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
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-ink hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
