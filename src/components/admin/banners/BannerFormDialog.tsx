"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{banner ? "Edit Banner" : "New Banner"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <p className="rounded-lg bg-signal-soft px-3 py-2 text-xs font-medium text-signal">{error}</p>}
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Eyebrow</Label>
            <Input required value={values.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} className="h-10" placeholder="Built For Every Game" />
          </div>
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Title</Label>
            <Input required value={values.title} onChange={(e) => set("title", e.target.value)} className="h-10" />
          </div>
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Subtitle</Label>
            <Textarea rows={2} value={values.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-ink-soft">CTA Label</Label>
              <Input required value={values.ctaLabel} onChange={(e) => set("ctaLabel", e.target.value)} className="h-10" />
            </div>
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-ink-soft">CTA Link</Label>
              <Input required value={values.ctaHref} onChange={(e) => set("ctaHref", e.target.value)} className="h-10" placeholder="/category/football" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Category</Label>
              <Select value={values.categoryId ?? "__none"} onValueChange={(v) => set("categoryId", v === "__none" ? null : v)}>
                <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">None</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Sort Order</Label>
              <Input type="number" value={values.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} className="h-10" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <Switch checked={values.isActive} onCheckedChange={(v) => set("isActive", v)} />
            Active (upload both images before activating)
          </label>
          <DialogFooter>
            <Button type="submit" disabled={isPending} className="rounded-full">
              {isPending ? "Saving…" : banner ? "Save Changes" : "Create Banner"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
