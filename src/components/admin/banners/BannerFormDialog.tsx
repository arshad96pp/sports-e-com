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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BannerFormValues } from "@/lib/services/admin-banner-service";
import { createBannerAction, updateBannerAction } from "@/lib/actions/admin/banner-actions";

interface BannerLike extends BannerFormValues {
  id: string;
}

export function BannerFormDialog({ banner, categories }: { banner?: BannerLike; categories: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<BannerFormValues>(
    banner ?? {
      eyebrow: "",
      title: "",
      subtitle: "",
      ctaLabel: "Shop Now",
      ctaHref: "/",
      categoryId: null,
      sortOrder: 0,
      isActive: false,
    }
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof BannerFormValues>(key: K, value: BannerFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = banner ? await updateBannerAction(banner.id, values) : await createBannerAction(values);
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
        {banner ? (
          <Button variant="outline" size="sm">Edit</Button>
        ) : (
          <Button className="rounded-full"><Plus className="h-4 w-4" />New Banner</Button>
        )}
      </DialogTrigger>
      <AdminModalContent size="lg">
        <AdminModalHeader title={banner ? "Edit Banner" : "New Banner"} />
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <AdminModalBody className="flex flex-col gap-4">
            <AdminModalError>{error}</AdminModalError>
            <AdminFormField label="Eyebrow">
              <Input
                required
                value={values.eyebrow}
                onChange={(e) => set("eyebrow", e.target.value)}
                className="h-10"
                placeholder="Built For Every Game"
              />
            </AdminFormField>
            <AdminFormField label="Title">
              <Input required value={values.title} onChange={(e) => set("title", e.target.value)} className="h-10" />
            </AdminFormField>
            <AdminFormField label="Subtitle">
              <Textarea rows={2} value={values.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
            </AdminFormField>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <AdminFormField label="CTA Label">
                <Input required value={values.ctaLabel} onChange={(e) => set("ctaLabel", e.target.value)} className="h-10" />
              </AdminFormField>
              <AdminFormField label="CTA Link">
                <Input
                  required
                  value={values.ctaHref}
                  onChange={(e) => set("ctaHref", e.target.value)}
                  className="h-10"
                  placeholder="/category/football"
                />
              </AdminFormField>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <AdminFormField label="Category">
                <Select value={values.categoryId ?? "__none"} onValueChange={(v) => set("categoryId", v === "__none" ? null : v)}>
                  <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">None</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </AdminFormField>
              <AdminFormField label="Sort Order">
                <Input type="number" value={values.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} className="h-10" />
              </AdminFormField>
            </div>
            <label className={`flex items-center gap-2 text-sm text-ink-soft ${banner ? "" : "opacity-50"}`}>
              <Switch checked={values.isActive} onCheckedChange={(v) => set("isActive", v)} disabled={!banner} />
              {banner ? "Active" : "Active (upload a desktop image after creating, then edit to activate)"}
            </label>
          </AdminModalBody>
          <AdminModalFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="rounded-full" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending} className="rounded-full">
              {isPending ? "Saving…" : banner ? "Save Changes" : "Create Banner"}
            </Button>
          </AdminModalFooter>
        </form>
      </AdminModalContent>
    </Dialog>
  );
}
