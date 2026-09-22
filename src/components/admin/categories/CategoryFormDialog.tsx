"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, Plus, Upload } from "lucide-react";
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
import { NumberInput } from "@/components/ui/number-input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { AdminCategory } from "@/lib/services/admin-category-service";
import type { CategoryFormValues } from "@/lib/services/admin-category-service";
import { createCategoryAction, updateCategoryAction, uploadCategoryImageAction } from "@/lib/actions/admin/category-actions";
import { optimizeImageForUpload } from "@/lib/utils/client-image";
import { finiteOrZero } from "@/lib/utils/number-input";
import { useToast } from "@/lib/context/ToastContext";

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

function valuesFromCategory(category: AdminCategory): CategoryFormValues {
  return {
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
  };
}

export function CategoryFormDialog({ category }: { category?: AdminCategory }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<CategoryFormValues>(category ? valuesFromCategory(category) : EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  function set<K extends keyof CategoryFormValues>(key: K, value: CategoryFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setValues(category ? valuesFromCategory(category) : EMPTY);
      setError(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const payload = { ...values, sortOrder: finiteOrZero(values.sortOrder) };
      const result = category ? await updateCategoryAction(category.id, payload) : await createCategoryAction(payload);
      if (!result.ok) {
        const message = result.error ?? (category ? "Failed to update category" : "Failed to create category");
        setError(message);
        showToast(message, "error");
        return;
      }
      const selectedFile = fileRef.current?.files?.[0];
      const categoryId = category?.id ?? result.data?.id;
      if (selectedFile && categoryId) {
        const optimized = await optimizeImageForUpload(selectedFile);
        if (!optimized.ok) {
          setError(optimized.error);
          showToast(optimized.error, "error");
          return;
        }
        const formData = new FormData();
        formData.set("file", optimized.file);
        const uploadResult = await uploadCategoryImageAction(categoryId, formData);
        if (!uploadResult.ok) {
          setError(uploadResult.error ?? "Failed to upload category image");
          showToast(uploadResult.error ?? "Failed to upload category image", "error");
          return;
        }
      }
      showToast(category ? "Category updated successfully" : "Category created successfully", "success");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {category ? (
          <Button variant="outline" size="sm">Edit</Button>
        ) : (
          <Button className="rounded-full"><Plus className="h-4 w-4" />New Category</Button>
        )}
      </DialogTrigger>
      <AdminModalContent size="lg">
        <AdminModalHeader title={category ? "Edit Category" : "New Category"} />
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <AdminModalBody className="flex flex-col gap-4">
            <AdminModalError>{error}</AdminModalError>
            <AdminFormField label="Name">
              <Input
                required
                value={values.name}
                onChange={(e) => {
                  set("name", e.target.value);
                  set("slug", slugify(e.target.value));
                }}
                className="h-10"
              />
            </AdminFormField>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <AdminFormField label="Slug">
                <Input required value={values.slug} onChange={(e) => set("slug", e.target.value)} className="h-10" />
              </AdminFormField>
              <AdminFormField label="Short Name (nav label)">
                <Input required value={values.shortName} onChange={(e) => set("shortName", e.target.value)} className="h-10" />
              </AdminFormField>
            </div>
            <AdminFormField label="Description">
              <Textarea required rows={2} value={values.description} onChange={(e) => set("description", e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Listing Blurb (shown on category page)">
              <Textarea rows={2} value={values.listingBlurb} onChange={(e) => set("listingBlurb", e.target.value)} />
            </AdminFormField>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <AdminFormField label="SEO Title">
                <Input value={values.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} className="h-10" />
              </AdminFormField>
              <AdminFormField label="Sort Order">
                <NumberInput value={values.sortOrder} onValueChange={(sortOrder) => set("sortOrder", sortOrder)} className="h-10" />
              </AdminFormField>
            </div>
            <AdminFormField label="SEO Description">
              <Textarea rows={2} value={values.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} />
            </AdminFormField>
            <AdminFormField
              label={
                <span className="flex items-center gap-1.5">
                  <Upload className="h-3.5 w-3.5" /> Image {category?.imageUrl && "(replace)"}
                </span>
              }
            >
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="text-sm" />
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
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? (category ? "Saving…" : "Creating…") : category ? "Save Changes" : "Create Category"}
            </Button>
          </AdminModalFooter>
        </form>
      </AdminModalContent>
    </Dialog>
  );
}
