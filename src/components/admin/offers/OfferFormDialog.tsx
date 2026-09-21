"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Check, Plus, X } from "lucide-react";
import { cn } from "cn";
import { Dialog, DialogClose, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AdminModalContent,
  AdminModalBody,
  AdminModalFooter,
  AdminModalError,
} from "@/components/admin/AdminModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { AdminOffer, OfferFormValues } from "@/lib/services/admin-offer-service";
import { createOfferAction, updateOfferAction } from "@/lib/actions/admin/offer-actions";

const FIELD_SHELL =
  "flex min-w-0 cursor-text flex-col gap-1 rounded-2xl border border-[#E5E5E5] bg-white px-4 py-3 transition-colors focus-within:border-ink/35";
const NAKED_INPUT =
  "h-8 min-w-0 border-0 bg-transparent p-0 text-sm text-ink shadow-none outline-none placeholder:text-muted-soft focus-visible:border-0 focus-visible:ring-0 md:text-sm";

function toDateInput(iso: string) {
  return iso ? iso.slice(0, 10) : "";
}

function categoryLines(name: string) {
  const [primary, ...rest] = name.trim().split(/\s+/);
  return { primary: primary || name, secondary: rest.join(" ") };
}

export function OfferFormDialog({
  offer,
  categories,
}: {
  offer?: AdminOffer;
  categories: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<OfferFormValues>(() =>
    offer
      ? { ...offer, startDate: toDateInput(offer.startDate), endDate: toDateInput(offer.endDate) }
      : {
          title: "",
          description: "",
          discountPercent: 10,
          startDate: new Date().toISOString().slice(0, 10),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          isActive: true,
          categoryIds: [],
          productIds: [],
        }
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isEditing = Boolean(offer);

  function set<K extends keyof OfferFormValues>(key: K, value: OfferFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload: OfferFormValues = {
      ...values,
      startDate: new Date(`${values.startDate}T00:00:00Z`).toISOString(),
      endDate: new Date(`${values.endDate}T23:59:59Z`).toISOString(),
    };
    startTransition(async () => {
      const result = offer ? await updateOfferAction(offer.id, payload) : await createOfferAction(payload);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setOpen(false);
    });
  }

  function toggleCategory(id: string, selected: boolean) {
    set("categoryIds", selected ? [...values.categoryIds, id] : values.categoryIds.filter((cid) => cid !== id));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {offer ? (
          <Button variant="outline" size="sm">Edit</Button>
        ) : (
          <Button className="rounded-full"><Plus className="h-4 w-4" />New Offer</Button>
        )}
      </DialogTrigger>
      <AdminModalContent
        size="xl"
        className="rounded-3xl border-[#E5E5E5] shadow-[0_24px_80px_rgba(10,10,10,0.10)] sm:max-w-170"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 px-5 pt-6 sm:px-8 sm:pt-7">
          <div className="min-w-0 pr-2">
            <DialogTitle className="font-display text-xl font-semibold tracking-tight text-ink">
              {isEditing ? "Edit offer" : "Create offer"}
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-sm leading-relaxed text-muted">
              {isEditing
                ? "Update this limited-time offer for selected sports."
                : "Set up a limited-time offer for selected sports."}
            </DialogDescription>
          </div>
          <DialogClose className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink">
            <X className="h-4 w-4" strokeWidth={1.75} />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <AdminModalBody className="flex flex-col gap-5 px-5 py-5 sm:px-8">
            <AdminModalError>{error}</AdminModalError>

            <label className={FIELD_SHELL}>
              <span className="text-[13px] font-medium text-muted">Offer title</span>
              <Input
                required
                value={values.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Summer Football Sale"
                className={NAKED_INPUT}
              />
            </label>

            <label className={FIELD_SHELL}>
              <span className="text-[13px] font-medium text-muted">Description</span>
              <Textarea
                rows={2}
                value={values.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Save on selected football accessories..."
                className="field-sizing-fixed min-h-13 resize-none border-0 bg-transparent p-0 text-sm text-ink shadow-none placeholder:text-muted-soft focus-visible:border-0 focus-visible:ring-0 md:text-sm"
              />
            </label>

            <div>
              <p className="mb-2 text-sm font-medium text-ink">Discount</p>
              <div className="relative w-37">
                <Input
                  required
                  type="number"
                  min={0}
                  max={100}
                  inputMode="numeric"
                  value={values.discountPercent}
                  onChange={(e) => set("discountPercent", Number(e.target.value))}
                  className="h-12 rounded-2xl border-[#E5E5E5] bg-white px-4 pr-10 text-sm text-ink shadow-none [appearance:textfield] focus-visible:border-ink/35 focus-visible:ring-0 md:text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-muted">
                  %
                </span>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-ink">Offer period</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className={FIELD_SHELL}>
                  <span className="text-[13px] font-medium text-muted">Start date</span>
                  <Input
                    required
                    type="date"
                    value={values.startDate}
                    onChange={(e) => set("startDate", e.target.value)}
                    className={cn(NAKED_INPUT, "scheme-light")}
                  />
                </label>
                <label className={FIELD_SHELL}>
                  <span className="text-[13px] font-medium text-muted">End date</span>
                  <Input
                    required
                    type="date"
                    value={values.endDate}
                    onChange={(e) => set("endDate", e.target.value)}
                    className={cn(NAKED_INPUT, "scheme-light")}
                  />
                </label>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-ink">Applicable categories</p>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((c) => {
                  const selected = values.categoryIds.includes(c.id);
                  const { primary, secondary } = categoryLines(c.name);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleCategory(c.id, !selected)}
                      className={cn(
                        "flex min-h-27 flex-col items-start rounded-2xl border p-3.5 text-left transition-colors outline-none focus-visible:border-ink/40",
                        selected
                          ? "border-success/45 bg-success-soft"
                          : "border-[#E5E5E5] bg-white hover:border-border-strong hover:bg-surface/60"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full",
                          selected ? "bg-success text-white" : "bg-transparent"
                        )}
                      >
                        {selected ? <Check className="h-3 w-3" strokeWidth={2.75} /> : null}
                      </span>
                      <span className="mt-auto pt-3">
                        <span className="block text-sm font-semibold leading-snug text-ink">{primary}</span>
                        {secondary ? (
                          <span className="mt-0.5 block text-[13px] leading-snug text-muted">{secondary}</span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className={cn(
                "flex items-center justify-between gap-4 rounded-2xl border px-4 py-3.5",
                values.isActive ? "border-success/30 bg-success-soft/70" : "border-[#E5E5E5] bg-white"
              )}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">Active offer</p>
                <p className="mt-0.5 text-[13px] leading-snug text-muted">
                  Customers can see this offer immediately.
                </p>
              </div>
              <Switch
                checked={values.isActive}
                onCheckedChange={(v) => set("isActive", v)}
                className="data-checked:bg-success"
              />
            </div>
          </AdminModalBody>

          <AdminModalFooter className="flex-col gap-3 border-[#E5E5E5] px-5 py-4 sm:flex-row sm:px-8">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full rounded-2xl border-[#E5E5E5] bg-white px-5 text-sm font-medium text-ink hover:bg-surface sm:w-auto"
                disabled={isPending}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isPending}
              className="h-11 w-full rounded-2xl bg-ink px-5 text-sm font-medium text-white hover:bg-ink/90 sm:w-auto"
            >
              {isPending ? "Saving…" : isEditing ? "Save changes" : "Create offer"}
              {!isPending && <ArrowRight className="h-4 w-4" strokeWidth={2} />}
            </Button>
          </AdminModalFooter>
        </form>
      </AdminModalContent>
    </Dialog>
  );
}
