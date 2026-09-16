"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { STORE } from "@/lib/config";
import { useToast } from "@/lib/context/ToastContext";
import { getAuthClientPort } from "@/lib/config/providers.client";
import { registerSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterPageClient() {
  const router = useRouter();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    const parsed = registerSchema.safeParse({ fullName, email, phone, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid details");
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setError(null);

    try {
      const { error } = await getAuthClientPort().signUp(parsed.data.email, parsed.data.password, {
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
      });
      if (error) {
        setError(
          error.message.toLowerCase().includes("already registered")
            ? "An account with this email already exists."
            : error.message
        );
        return;
      }
      showToast(`Account created. Welcome, ${parsed.data.fullName.split(" ")[0]}!`, "success");
      router.replace("/account");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container-app flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl font-extrabold tracking-tight text-ink">{STORE.name}</span>
          <h1 className="mt-4 font-display text-xl font-bold text-ink">Create your account</h1>
          <p className="mt-1 text-sm text-muted">Join to save your favourites and addresses</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="reg-name" className="mb-1.5 text-xs font-semibold text-ink-soft">
              Full Name
            </Label>
            <Input
              id="reg-name"
              type="text"
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
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11"
            />
          </div>
          <div>
            <Label htmlFor="reg-phone" className="mb-1.5 text-xs font-semibold text-ink-soft">
              Phone
            </Label>
            <Input
              id="reg-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="h-11"
            />
          </div>
          <div>
            <Label htmlFor="reg-password" className="mb-1.5 text-xs font-semibold text-ink-soft">
              Password
            </Label>
            <Input
              id="reg-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11"
            />
          </div>
          <div>
            <Label htmlFor="reg-confirm" className="mb-1.5 text-xs font-semibold text-ink-soft">
              Confirm Password
            </Label>
            <Input
              id="reg-confirm"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11"
            />
          </div>

          {error && <p className="text-xs font-medium text-signal">{error}</p>}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-11 w-full rounded-full text-sm font-bold"
          >
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
