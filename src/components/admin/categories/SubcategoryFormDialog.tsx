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
  AdminFormField,
} from "@/components/admin/AdminModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AdminCategory, AdminSubcategory, SubcategoryFormValues } from "@/lib/services/admin-category-service";
import { createSubcategoryAction, updateSubcategoryAction } from "@/lib/actions/admin/category-actions";
import { useToast } from "@/lib/context/ToastContext";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function SubcategoryFormDialog({ categories, subcategory }: { categories: AdminCategory[]; subcategory?: AdminSubcategory }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<SubcategoryFormValues>(
    subcategory
      ? { categoryId: subcategory.categoryId, name: subcategory.name, slug: subcategory.slug, isActive: subcategory.isActive }
      : { categoryId: categories[0]?.id ?? "", name: "", slug: "", isActive: true }
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  function set<K extends keyof SubcategoryFormValues>(key: K, value: SubcategoryFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = subcategory ? await updateSubcategoryAction(subcategory.id, values) : await createSubcategoryAction(values);
      if (!result.ok) {
        const message = result.error ?? (subcategory ? "Failed to update subcategory" : "Failed to create subcategory");
        setError(message);
        showToast(message, "error");
        return;
      }
      showToast(subcategory ? "Subcategory updated successfully" : "Subcategory created successfully", "success");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {subcategory ? (
          <Button variant="outline" size="sm">Edit</Button>
        ) : (
          <Button className="rounded-full"><Plus className="h-4 w-4" />New Subcategory</Button>
        )}
      </DialogTrigger>
      <AdminModalContent size="md">
        <AdminModalHeader title={subcategory ? "Edit Subcategory" : "New Subcategory"} />
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <AdminModalBody className="flex flex-col gap-4">
            <AdminModalError>{error}</AdminModalError>
            <AdminFormField label="Category" htmlFor="subcategory-category">
              <Select value={values.categoryId} onValueChange={(v) => set("categoryId", v)}>
                <SelectTrigger id="subcategory-category" className="h-10 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AdminFormField>
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
            <AdminFormField label="Slug">
              <Input required value={values.slug} onChange={(e) => set("slug", e.target.value)} className="h-10" />
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
              {isPending ? (subcategory ? "Saving…" : "Creating…") : subcategory ? "Save Changes" : "Create Subcategory"}
            </Button>
          </AdminModalFooter>
        </form>
      </AdminModalContent>
    </Dialog>
  );
}
