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
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AdminCategory, AdminSubcategory, SubcategoryFormValues } from "@/lib/services/admin-category-service";
import { createSubcategoryAction, updateSubcategoryAction } from "@/lib/actions/admin/category-actions";

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

  function set<K extends keyof SubcategoryFormValues>(key: K, value: SubcategoryFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = subcategory ? await updateSubcategoryAction(subcategory.id, values) : await createSubcategoryAction(values);
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
        {subcategory ? (
          <Button variant="outline" size="sm">Edit</Button>
        ) : (
          <Button className="rounded-full"><Plus className="h-4 w-4" />New Subcategory</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{subcategory ? "Edit Subcategory" : "New Subcategory"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <p className="rounded-lg bg-signal-soft px-3 py-2 text-xs font-medium text-signal">{error}</p>}
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Category</Label>
            <Select value={values.categoryId} onValueChange={(v) => set("categoryId", v)}>
              <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Slug</Label>
            <Input required value={values.slug} onChange={(e) => set("slug", e.target.value)} className="h-10" />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <Switch checked={values.isActive} onCheckedChange={(v) => set("isActive", v)} />
            Active
          </label>
          <DialogFooter>
            <Button type="submit" disabled={isPending} className="rounded-full">
              {isPending ? "Saving…" : subcategory ? "Save Changes" : "Create Subcategory"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
