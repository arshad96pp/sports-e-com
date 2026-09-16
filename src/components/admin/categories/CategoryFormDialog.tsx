"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, Upload } from "lucide-react";
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
import type { AdminCategory } from "@/lib/services/admin-category-service";
import type { CategoryFormValues } from "@/lib/services/admin-category-service";
import { createCategoryAction, updateCategoryAction, uploadCategoryImageAction } from "@/lib/actions/admin/category-actions";
import { optimizeImageForUpload } from "@/lib/utils/client-image";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const EMPTY: CategoryFormValues = {
  name: "",
  slug: "",
  shortName: "",
  description: "",
  listingBlurb: "",
  seoTitle: "",
  seoDescription: "",
  sortOrder: 0,
  isActive: true,
  icon: "other",
};

export function CategoryFormDialog({ category }: { category?: AdminCategory }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<CategoryFormValues>(
    category
      ? {
          name: category.name,
          slug: category.slug,
          shortName: category.shortName,
          description: category.description,
          listingBlurb: category.listingBlurb,
          seoTitle: category.seoTitle,
          seoDescription: category.seoDescription,
          sortOrder: category.sortOrder,
          isActive: category.isActive,
          icon: "other",
        }
      : EMPTY
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof CategoryFormValues>(key: K, value: CategoryFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = category ? await updateCategoryAction(category.id, values) : await createCategoryAction(values);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      const selectedFile = fileRef.current?.files?.[0];
      const categoryId = category?.id ?? result.data?.id;
      if (selectedFile && categoryId) {
        const optimized = await optimizeImageForUpload(selectedFile);
        if (!optimized.ok) {
          setError(optimized.error);
          return;
        }
        const formData = new FormData();
        formData.set("file", optimized.file);
        await uploadCategoryImageAction(categoryId, formData);
      }
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {category ? (
          <Button variant="outline" size="sm">Edit</Button>
        ) : (
          <Button className="rounded-full"><Plus className="h-4 w-4" />New Category</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "New Category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <p className="rounded-lg bg-signal-soft px-3 py-2 text-xs font-medium text-signal">{error}</p>}
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Name</Label>
            <Input
              required
              value={values.name}
              onChange={(e) => {
                set("name", e.target.value);
                set("slug", slugify(e.target.value));
              }}
              className="h-10"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Slug</Label>
              <Input required value={values.slug} onChange={(e) => set("slug", e.target.value)} className="h-10" />
            </div>
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Short Name (nav label)</Label>
              <Input required value={values.shortName} onChange={(e) => set("shortName", e.target.value)} className="h-10" />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Description</Label>
            <Textarea required rows={2} value={values.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Listing Blurb (shown on category page)</Label>
            <Textarea rows={2} value={values.listingBlurb} onChange={(e) => set("listingBlurb", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-ink-soft">SEO Title</Label>
              <Input value={values.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} className="h-10" />
            </div>
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Sort Order</Label>
              <Input type="number" value={values.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} className="h-10" />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">SEO Description</Label>
            <Textarea rows={2} value={values.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
              <Upload className="h-3.5 w-3.5" /> Image {category?.imageUrl && "(replace)"}
            </Label>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <Switch checked={values.isActive} onCheckedChange={(v) => set("isActive", v)} />
            Active
          </label>
          <DialogFooter>
            <Button type="submit" disabled={isPending} className="rounded-full">
              {isPending ? "Saving…" : category ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
