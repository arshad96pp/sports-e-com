"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { StoreSettingsDTO } from "@/lib/services/settings-service";
import { updateStoreSettingsAction } from "@/lib/actions/admin/settings-actions";
import { useToast } from "@/lib/context/ToastContext";

export function SettingsForm({ initial }: { initial: StoreSettingsDTO }) {
  const [values, setValues] = useState(initial);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function set<K extends keyof StoreSettingsDTO>(key: K, value: StoreSettingsDTO[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await updateStoreSettingsAction(values);
      if (!result.ok) {
        const text = result.error ?? "Failed to save settings";
        setMessage({ type: "error", text });
        showToast(text, "error");
        return;
      }
      setMessage({ type: "ok", text: "Settings saved." });
      showToast("Settings saved successfully", "success");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {message && (
        <p className={`rounded-lg px-3 py-2.5 text-sm font-medium ${message.type === "ok" ? "bg-success-soft text-success" : "bg-signal-soft text-signal"}`}>
          {message.text}
        </p>
      )}

      <section className="rounded-xl border border-border bg-white p-5">
        <h2 className="font-display text-base font-bold text-ink">Orders</h2>
        <div className="mt-4">
          <Label htmlFor="settings-whatsapp" className="mb-1.5 text-xs font-semibold text-ink-soft">WhatsApp Number (digits only, intl. format)</Label>
          <Input id="settings-whatsapp" value={values.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value)} className="h-10" placeholder="919876543210" />
          <p className="mt-1.5 text-xs text-muted">Orders are sent to this number as a WhatsApp message at checkout. Leave blank to use the site&apos;s default number instead.</p>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} className="h-11 rounded-full px-8 text-sm font-bold">
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Saving…" : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
