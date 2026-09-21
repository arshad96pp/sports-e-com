"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { Dialog, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import {
  AdminModalContent,
  AdminModalHeader,
  AdminModalBody,
  AdminModalFooter,
  AdminModalError,
} from "@/components/admin/AdminModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AdminOffer, OfferFormValues } from "@/lib/services/admin-offer-service";
import { createOfferAction, updateOfferAction } from "@/lib/actions/admin/offer-actions";
import { useToast } from "@/lib/context/ToastContext";

function toDateInput(iso: string) {
  return iso ? iso.slice(0, 10) : "";
}

function emptyForm(): OfferFormValues {
  return {
    title: "",
    description: "",
    discountPercent: 10,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    isActive: true,
    categoryIds: [],
    productIds: [],
  };
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
      ? {
          ...offer,
          startDate: toDateInput(offer.startDate),
          endDate: toDateInput(offer.endDate),
          categoryIds: offer.categoryIds.slice(0, 1),
        }
      : emptyForm()
  );
  const [error, setError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const isEditing = Boolean(offer);
  const formId = offer?.id ?? "create";
  const selectedCategoryId = values.categoryIds[0];

  function set<K extends keyof OfferFormValues>(key: K, value: OfferFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!selectedCategoryId) {
      setCategoryError("Select a category.");
      return;
    }
    setCategoryError(null);
    const payload: OfferFormValues = {
      ...values,
      categoryIds: [selectedCategoryId],
      startDate: new Date(`${values.startDate}T00:00:00Z`).toISOString(),
      endDate: new Date(`${values.endDate}T23:59:59Z`).toISOString(),
    };
    startTransition(async () => {
      const result = offer ? await updateOfferAction(offer.id, payload) : await createOfferAction(payload);
      if (!result.ok) {
        const message = result.error ?? (isEditing ? "Failed to update offer" : "Failed to create offer");
        setError(message);
        showToast(message, "error");
        return;
      }
      showToast(isEditing ? "Offer updated successfully" : "Offer created successfully", "success");
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
      <AdminModalContent size="lg" className="sm:max-w-140">
        <AdminModalHeader
          title={isEditing ? "Edit offer" : "Create offer"}
          description={
            isEditing
              ? "Update this discount offer for a specific sports category."
              : "Add a discount offer for a specific sports category."
          }
        />
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <AdminModalBody className="flex flex-col gap-3.5 py-4">
            <AdminModalError>{error}</AdminModalError>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${formId}-title`}>Offer title</Label>
              <Input
                id={`${formId}-title`}
                required
                value={values.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Enter offer title"
                className="h-9"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${formId}-description`}>Description</Label>
              <Textarea
                id={`${formId}-description`}
                rows={3}
                value={values.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Enter a short description..."
                className="field-sizing-fixed min-h-18 resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${formId}-discount`}>Discount</Label>
              <div className="flex items-center gap-2">
                <Input
                  id={`${formId}-discount`}
                  required
                  type="number"
                  min={0}
                  max={100}
                  inputMode="numeric"
                  value={values.discountPercent}
                  onChange={(e) => set("discountPercent", Number(e.target.value))}
                  className="h-9 w-20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="text-sm text-muted">%</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${formId}-category`}>Category</Label>
              <Select
                value={selectedCategoryId}
                onValueChange={(id) => {
                  setCategoryError(null);
                  set("categoryIds", [id]);
                }}
              >
                <SelectTrigger
                  id={`${formId}-category`}
                  className="h-9 w-full"
                  aria-invalid={Boolean(categoryError)}
                  aria-required="true"
                >
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {categoryError ? (
                <p role="alert" className="text-xs font-medium text-signal">{categoryError}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Offer period</Label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`${formId}-start`} className="font-normal text-muted">Start date</Label>
                  <Input
                    id={`${formId}-start`}
                    required
                    type="date"
                    value={values.startDate}
                    onChange={(e) => set("startDate", e.target.value)}
                    className="h-9 scheme-light"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`${formId}-end`} className="font-normal text-muted">End date</Label>
                  <Input
                    id={`${formId}-end`}
                    required
                    type="date"
                    value={values.endDate}
                    onChange={(e) => set("endDate", e.target.value)}
                    className="h-9 scheme-light"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Active</Label>
              <div className="flex items-center gap-2.5">
                <Switch
                  checked={values.isActive}
                  onCheckedChange={(v) => set("isActive", v)}
                  aria-label="Make this offer active"
                />
                <span className="text-sm text-muted">Make this offer visible to customers</span>
              </div>
            </div>
          </AdminModalBody>

          <AdminModalFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? (isEditing ? "Saving…" : "Creating…") : isEditing ? "Save changes" : "Create offer"}
            </Button>
          </AdminModalFooter>
        </form>
      </AdminModalContent>
    </Dialog>
  );
}
