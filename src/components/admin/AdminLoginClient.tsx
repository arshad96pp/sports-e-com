"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STORE } from "@/lib/config";

export function AdminLoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError || !data.user) {
      setError("Incorrect email or password.");
      setPending(false);
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("role, is_active").eq("id", data.user.id).single();

    if (!profile || profile.role !== "super_admin" || !profile.is_active) {
      await supabase.auth.signOut();
      setError("Access denied — this account is not authorized for admin access.");
      setPending(false);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl font-extrabold tracking-tight text-white">{STORE.name}</span>
          <div className="mx-auto mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <ShieldAlert className="h-5 w-5 text-accent" />
          </div>
          <h1 className="mt-4 font-display text-xl font-bold text-white">Admin Access</h1>
          <p className="mt-1 text-sm text-white/50">Authorized personnel only.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div>
            <Label htmlFor="admin-email" className="mb-1.5 text-xs font-semibold text-white/70">
              Email
            </Label>
            <Input
              id="admin-email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 border-white/15 bg-white/5 text-white placeholder:text-white/30"
              placeholder="admin@stryde.in"
            />
          </div>
          <div>
            <Label htmlFor="admin-password" className="mb-1.5 text-xs font-semibold text-white/70">
              Password
            </Label>
            <Input
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 border-white/15 bg-white/5 text-white placeholder:text-white/30"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-signal/10 px-3 py-2.5 text-xs font-medium text-signal">
              {error}
            </p>
          )}

          <Button type="submit" disabled={pending} className="mt-2 h-11 w-full rounded-full bg-accent text-sm font-bold text-accent-ink hover:bg-accent/90">
            {pending ? "Signing in…" : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
