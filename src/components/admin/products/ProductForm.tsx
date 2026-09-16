"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AdminCategory } from "@/lib/services/admin-category-service";
import type { ProductFormValues } from "@/lib/services/admin-product-service";
import { createProductAction, updateProductAction } from "@/lib/actions/admin/product-actions";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function TagListInput({ label, values, onChange, placeholder }: { label: string; values: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState("");

  function add() {
    const v = draft.trim();
    if (!v || values.includes(v)) return;
    onChange([...values, v]);
    setDraft("");
  }

  return (
    <div>
      <Label className="mb-1.5 text-xs font-semibold text-ink-soft">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="h-10"
        />
        <Button type="button" variant="outline" onClick={add} className="h-10 shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {values.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span key={v} className="flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-ink-soft">
              {v}
              <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`Remove ${v}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const EMPTY: ProductFormValues = {
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  sku: "",
  categoryId: "",
  subcategoryId: null,
  brand: "",
  sport: "",
  productType: "",
  price: 0,
  mrp: 0,
  stock: 0,
  sizes: [],
  colors: [],
  highlights: [],
  specifications: [],
  isFeatured: false,
  isBestSeller: false,
  isNewArrival: false,
  isDealOfTheDay: false,
  isActive: true,
  seoTitle: "",
  seoDescription: "",
};

interface ProductFormProps {
  categories: AdminCategory[];
  initial?: ProductFormValues;
  productId?: string;
}

export function ProductForm({ categories, initial, productId }: ProductFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(initial ?? EMPTY);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const category = categories.find((c) => c.id === values.categoryId);

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = productId ? await updateProductAction(productId, values) : await createProductAction(values);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      if (!productId && result.data) {
        router.push(`/admin/products/${result.data.id}/edit`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && <p className="rounded-lg bg-signal-soft px-3 py-2.5 text-sm font-medium text-signal">{error}</p>}

      <section className="rounded-xl border border-border bg-white p-5">
        <h2 className="font-display text-base font-bold text-ink">Basic Information</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Name</Label>
            <Input
              required
              value={values.name}
              onChange={(e) => {
                set("name", e.target.value);
                if (!slugTouched) set("slug", slugify(e.target.value));
              }}
              className="h-10"
            />
          </div>
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Slug</Label>
            <Input
              required
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
              className="h-10"
            />
          </div>
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">SKU</Label>
            <Input required value={values.sku} onChange={(e) => set("sku", e.target.value)} className="h-10" />
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Short Description</Label>
            <Input required value={values.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} className="h-10" />
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Description</Label>
            <Textarea required rows={4} value={values.description} onChange={(e) => set("description", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-5">
        <h2 className="font-display text-base font-bold text-ink">Categorization</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Category</Label>
            <Select value={values.categoryId} onValueChange={(v) => setValues((s) => ({ ...s, categoryId: v, subcategoryId: null }))}>
              <SelectTrigger className="h-10 w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Subcategory</Label>
            <Select value={values.subcategoryId ?? "__none"} onValueChange={(v) => set("subcategoryId", v === "__none" ? null : v)}>
              <SelectTrigger className="h-10 w-full"><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">None</SelectItem>
                {category?.subcategories.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Brand</Label>
            <Input required value={values.brand} onChange={(e) => set("brand", e.target.value)} className="h-10" />
          </div>
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Sport</Label>
            <Input required value={values.sport} onChange={(e) => set("sport", e.target.value)} className="h-10" />
          </div>
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Product Type</Label>
            <Input required value={values.productType} onChange={(e) => set("productType", e.target.value)} className="h-10" />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-5">
        <h2 className="font-display text-base font-bold text-ink">Pricing & Stock</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Price (₹)</Label>
            <Input required type="number" min={0} step="0.01" value={values.price} onChange={(e) => set("price", Number(e.target.value))} className="h-10" />
          </div>
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">MRP (₹)</Label>
            <Input required type="number" min={0} step="0.01" value={values.mrp} onChange={(e) => set("mrp", Number(e.target.value))} className="h-10" />
          </div>
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Stock</Label>
            <Input required type="number" min={0} value={values.stock} onChange={(e) => set("stock", Number(e.target.value))} className="h-10" />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-5">
        <h2 className="font-display text-base font-bold text-ink">Variants & Highlights</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TagListInput label="Sizes" values={values.sizes} onChange={(v) => set("sizes", v)} placeholder="e.g. M, L, XL" />
          <TagListInput label="Colors" values={values.colors} onChange={(v) => set("colors", v)} placeholder="e.g. Black, Red" />
          <div className="sm:col-span-2">
            <TagListInput label="Highlights" values={values.highlights} onChange={(v) => set("highlights", v)} placeholder="e.g. Sweat-wicking fabric" />
          </div>
        </div>

        <div className="mt-5">
          <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Specifications</Label>
          <div className="flex flex-col gap-2">
            {values.specifications.map((spec, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Label"
                  value={spec.label}
                  onChange={(e) => {
                    const next = [...values.specifications];
                    next[i] = { ...next[i], label: e.target.value };
                    set("specifications", next);
                  }}
                  className="h-10"
                />
                <Input
                  placeholder="Value"
                  value={spec.value}
                  onChange={(e) => {
                    const next = [...values.specifications];
                    next[i] = { ...next[i], value: e.target.value };
                    set("specifications", next);
                  }}
                  className="h-10"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="shrink-0"
                  onClick={() => set("specifications", values.specifications.filter((_, idx) => idx !== i))}
                  aria-label="Remove specification"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => set("specifications", [...values.specifications, { label: "", value: "" }])}
              className="w-fit"
            >
              <Plus className="h-4 w-4" />
              Add Specification
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-5">
        <h2 className="font-display text-base font-bold text-ink">Flags</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {(
            [
              ["isActive", "Active"],
              ["isFeatured", "Featured"],
              ["isBestSeller", "Best Seller"],
              ["isNewArrival", "New Arrival"],
              ["isDealOfTheDay", "Deal of the Day"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm text-ink-soft">
              <Switch checked={values[key]} onCheckedChange={(v) => set(key, v)} />
              {label}
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-5">
        <h2 className="font-display text-base font-bold text-ink">SEO</h2>
        <div className="mt-4 grid grid-cols-1 gap-4">
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">SEO Title</Label>
            <Input value={values.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} className="h-10" />
          </div>
          <div>
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">SEO Description</Label>
            <Textarea rows={2} value={values.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} />
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isPending} className="h-11 rounded-full px-8 text-sm font-bold">
          {isPending ? "Saving…" : productId ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
