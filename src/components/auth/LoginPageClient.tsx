"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { STORE } from "@/lib/config";
import { useToast } from "@/lib/context/ToastContext";
import { getAuthClientPort } from "@/lib/config/providers.client";
import { loginSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function LoginPageClient() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

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

      showToast("Welcome back!", "success");
      // Stop the button's loading state as soon as login succeeds — /account's own
      // data (profile, addresses, cart, etc.) loads independently behind loading.tsx.
      submittingRef.current = false;
      setIsSubmitting(false);
      router.replace("/account");
    } catch {
      setError("Something went wrong. Please try again.");
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container-app flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl font-extrabold tracking-tight text-ink">{STORE.name}</span>
          <h1 className="mt-4 font-display text-xl font-bold text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-muted">Log in to access your wishlist and account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="login-email" className="mb-1.5 text-xs font-semibold text-ink-soft">
              Email or Phone
            </Label>

            <Input
              id="login-email"
              type="text"
              required
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
            
            <Input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11"
            />
          </div>

          {error && <p className="text-xs font-medium text-signal">{error}</p>}

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-1.5 text-muted">
              <Checkbox checked={remember} onCheckedChange={(c) => setRemember(c === true)} />
              Remember me
            </label>
            <Link href="/forgot-password" className="font-medium text-ink hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-11 w-full rounded-full text-sm font-bold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Login"
            )}
          </Button>
          <Button asChild variant="outline" className="h-11 w-full rounded-full text-sm font-semibold">
            <Link href="/">Continue as Guest</Link>
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
