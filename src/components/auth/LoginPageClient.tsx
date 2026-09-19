"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { STORE } from "@/lib/config";
import { useToast } from "@/lib/context/ToastContext";
import { useTransitionNavigation } from "@/lib/hooks/useTransitionNavigation";
import { getAuthClientPort } from "@/lib/config/providers.client";
import { loginSchema } from "@/lib/validations/auth";
import { AccountSkeleton } from "@/components/account/AccountSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const LINK_ERROR_MESSAGES: Record<string, string> = {
  link_expired: "That link has expired or was already used.",
};

/**
 * Placeholder for a `callbackUrl` destination other than /account, which has
 * no dedicated skeleton to reuse. Wordless, like the destination skeletons
 * it stands in for — no "Loading..." copy.
 */
function GenericDestinationSkeleton() {
  return (
    <div className="container-app py-6">
      <Skeleton className="h-3.5 w-40" />
      <Skeleton className="mt-4 h-8 w-64" />
      <Skeleton className="mt-6 h-40 w-full rounded-xl" />
      <Skeleton className="mt-4 h-24 w-full rounded-xl" />
    </div>
  );
}

export function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { isNavigating, replace } = useTransitionNavigation();
  const callbackUrl = searchParams.get("callbackUrl");
  const linkError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(
    linkError ? LINK_ERROR_MESSAGES[linkError] ?? "Something went wrong. Please try again." : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Synchronous guard: state updates from rapid clicks/Enter presses can land
  // in the same tick before a re-render disables the button, so the actual
  // "have we already started this submission" check lives here, not in state.
  const submittingRef = useRef(false);

  const destination = callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/account";

  // Warm the destination's RSC payload before the user even finishes typing,
  // so navigation below can resolve instantly instead of waiting on a fresh
  // fetch once login succeeds.
  useEffect(() => {
    router.prefetch(destination);
  }, [router, destination]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current) return;

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid details");
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setError(null);

    try {
      const { error } = await getAuthClientPort().signInWithPassword(parsed.data.email, parsed.data.password);
      if (error) {
        setError(
          error.code === "email_not_confirmed"
            ? "Please confirm your email before logging in. Check your inbox for the confirmation link."
            : "Incorrect email or password."
        );
        submittingRef.current = false;
        setIsSubmitting(false);
        return;
      }

      // Toast is fire-and-forget — it must not gate or delay navigation.
      showToast("Welcome back!", "success");
      // Deliberately do NOT reset isSubmitting/submittingRef here. The very
      // next render swaps this component's output to the destination
      // skeleton (see the `isNavigating` check below), so there's no form
      // left to re-enable — the user is already looking at the account page.
      replace(destination);
    } catch {
      setError("Network error. Please check your connection and try again.");
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  // The instant navigation starts, stop showing the login form entirely and
  // show the destination's own skeleton instead — Header/Footer persist
  // across this navigation (same customer layout), so this reads as "you're
  // already on the account page" rather than a loading interstitial. When
  // the real navigation commits, this component unmounts and Next.js's own
  // loading.tsx (identical markup) or the final page takes over seamlessly.
  if (isNavigating) {
    return destination === "/account" ? <AccountSkeleton /> : <GenericDestinationSkeleton />;
  }

  return (
    <div className="container-app flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl font-bold tracking-tight text-ink">{STORE.name}</span>
          <h1 className="mt-4 font-display text-xl font-bold text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-muted">Log in to access your wishlist and account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div>
            <Label htmlFor="login-email" className="mb-1.5 text-xs font-semibold text-ink-soft">
              Email
            </Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              disabled={isSubmitting}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11"
            />
          </div>
          <div>
            <Label htmlFor="login-password" className="mb-1.5 text-xs font-semibold text-ink-soft">
              Password
            </Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
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
          </div>

          {error && (
            <p role="alert" className="text-xs font-medium text-signal">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-1.5 text-muted">
              <Checkbox checked={remember} onCheckedChange={(c) => setRemember(c === true)} disabled={isSubmitting} />
              Remember me
            </label>
            <Link href="/forgot-password" className="font-medium text-ink hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="mt-2 h-11 w-full rounded-full text-sm font-bold">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Login"
            )}
          </Button>

          <Button
            asChild
            variant="ghost"
            className={`h-11 w-full rounded-full text-sm font-semibold ${isSubmitting ? "pointer-events-none opacity-50" : ""}`}
          >
            <Link
              href="/"
              aria-disabled={isSubmitting}
              tabIndex={isSubmitting ? -1 : undefined}
              onClick={(e) => isSubmitting && e.preventDefault()}
            >
              Continue as Guest
            </Link>
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          New to {STORE.name}?{" "}
          <Link href="/register" className="font-semibold text-ink hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
