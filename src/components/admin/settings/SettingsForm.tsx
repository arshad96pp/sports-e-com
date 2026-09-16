"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { StoreSettingsDTO } from "@/lib/services/settings-service";
import { updateStoreSettingsAction, uploadStoreLogoAction } from "@/lib/actions/admin/settings-actions";
import { optimizeImageForUpload } from "@/lib/utils/client-image";

export function SettingsForm({ initial }: { initial: StoreSettingsDTO }) {
  const [values, setValues] = useState(initial);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const logoInputRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof StoreSettingsDTO>(key: K, value: StoreSettingsDTO[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await updateStoreSettingsAction(values);
      setMessage(result.ok ? { type: "ok", text: "Settings saved." } : { type: "error", text: result.error ?? "Could not save." });
    });
  }

  function handleLogoUpload(file: File | undefined) {
    if (!file) return;
    startTransition(async () => {
      const optimized = await optimizeImageForUpload(file);
      if (!optimized.ok) {
        setMessage({ type: "error", text: optimized.error });
        return;
      }
      const formData = new FormData();
      formData.set("file", optimized.file);
      const result = await uploadStoreLogoAction(formData);
      if (result.ok && result.data) set("logoUrl", result.data.url);
      else setMessage({ type: "error", text: result.error ?? "Logo upload failed." });
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
        <h2 className="font-display text-base font-bold text-ink">Store Identity</h2>
        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border-strong bg-surface text-muted hover:border-ink"
          >
            {values.logoUrl && <Image src={values.logoUrl} alt="" fill sizes="64px" className="object-contain" />}
            <Upload className="relative z-10 h-4 w-4" />
          </button>
          <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => handleLogoUpload(e.target.files?.[0])} />
          <div className="flex-1">
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Store Name</Label>
            <Input required value={values.storeName} onChange={(e) => set("storeName", e.target.value)} className="h-10" />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-5">
        <h2 className="font-display text-base font-bold text-ink">Contact</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">WhatsApp Number (digits only, intl. format)</Label>
            <Input required value={values.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value)} className="h-10" placeholder="919876543210" />
          </div>
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Contact Phone</Label>
            <Input required value={values.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} className="h-10" />
          </div>
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Contact Email</Label>
            <Input required type="email" value={values.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} className="h-10" />
          </div>
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Free Shipping Threshold (₹)</Label>
            <Input required type="number" min={0} value={values.freeShippingThreshold} onChange={(e) => set("freeShippingThreshold", Number(e.target.value))} className="h-10" />
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Address</Label>
            <Textarea rows={2} value={values.addressLine} onChange={(e) => set("addressLine", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-5">
        <h2 className="font-display text-base font-bold text-ink">Social Links</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(
            [
              ["instagramUrl", "Instagram"],
              ["facebookUrl", "Facebook"],
              ["twitterUrl", "Twitter / X"],
              ["youtubeUrl", "YouTube"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <Label className="mb-1.5 text-xs font-semibold text-ink-soft">{label}</Label>
              <Input value={values[key] ?? ""} onChange={(e) => set(key, e.target.value)} className="h-10" />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-5">
        <h2 className="font-display text-base font-bold text-ink">Policies & SEO Defaults</h2>
        <div className="mt-4 grid grid-cols-1 gap-4">
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Shipping Info</Label>
            <Textarea rows={2} value={values.shippingInfo} onChange={(e) => set("shippingInfo", e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Return Policy</Label>
            <Textarea rows={2} value={values.returnPolicy} onChange={(e) => set("returnPolicy", e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Default SEO Title</Label>
            <Input value={values.seoDefaultTitle} onChange={(e) => set("seoDefaultTitle", e.target.value)} className="h-10" />
          </div>
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Default SEO Description</Label>
            <Textarea rows={2} value={values.seoDefaultDescription} onChange={(e) => set("seoDefaultDescription", e.target.value)} />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} className="h-11 rounded-full px-8 text-sm font-bold">
          {isPending ? "Saving…" : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
