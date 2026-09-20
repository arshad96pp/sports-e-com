"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import {
  AdminModalContent,
  AdminModalHeader,
  AdminModalBody,
  AdminModalFooter,
  AdminModalError,
  AdminFormField,
} from "@/components/admin/AdminModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import type { AdminOffer, OfferFormValues } from "@/lib/services/admin-offer-service";
import { createOfferAction, updateOfferAction } from "@/lib/actions/admin/offer-actions";

function toDateInput(iso: string) {
  return iso ? iso.slice(0, 10) : "";
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {offer ? (
          <Button variant="outline" size="sm">Edit</Button>
        ) : (
          <Button className="rounded-full"><Plus className="h-4 w-4" />New Offer</Button>
        )}
      </DialogTrigger>
      <AdminModalContent size="lg">
        <AdminModalHeader title={offer ? "Edit Offer" : "New Offer"} />
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <AdminModalBody className="flex flex-col gap-4">
            <AdminModalError>{error}</AdminModalError>
            <AdminFormField label="Title">
              <Input required value={values.title} onChange={(e) => set("title", e.target.value)} className="h-10" />
            </AdminFormField>
            <AdminFormField label="Description">
              <Textarea rows={2} value={values.description} onChange={(e) => set("description", e.target.value)} />
            </AdminFormField>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <AdminFormField label="Discount %">
                <Input
                  required
                  type="number"
                  min={0}
                  max={100}
                  value={values.discountPercent}
                  onChange={(e) => set("discountPercent", Number(e.target.value))}
                  className="h-10"
                />
              </AdminFormField>
              <AdminFormField label="Start Date">
                <Input required type="date" value={values.startDate} onChange={(e) => set("startDate", e.target.value)} className="h-10" />
              </AdminFormField>
              <AdminFormField label="End Date">
                <Input required type="date" value={values.endDate} onChange={(e) => set("endDate", e.target.value)} className="h-10" />
              </AdminFormField>
            </div>
            <AdminFormField label="Applicable Categories">
              <div className="flex max-h-32 flex-col gap-1.5 overflow-y-auto rounded-lg border border-border p-2.5">
                {categories.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm text-ink-soft">
                    <Checkbox
                      checked={values.categoryIds.includes(c.id)}
                      onCheckedChange={(checked) =>
                        set("categoryIds", checked ? [...values.categoryIds, c.id] : values.categoryIds.filter((id) => id !== c.id))
                      }
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            </AdminFormField>
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <Switch checked={values.isActive} onCheckedChange={(v) => set("isActive", v)} />
              Active
            </label>
          </AdminModalBody>
          <AdminModalFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="rounded-full" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending} className="rounded-full">
              {isPending ? "Saving…" : offer ? "Save Changes" : "Create Offer"}
            </Button>
          </AdminModalFooter>
        </form>
      </AdminModalContent>
    </Dialog>
  );
}
