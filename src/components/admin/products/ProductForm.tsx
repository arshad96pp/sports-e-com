"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "@/components/admin/products/RichTextEditor";
import type { AdminCategory } from "@/lib/services/admin-category-service";
import type { ProductFormValues } from "@/lib/services/admin-product-service";
import type { VariantInput } from "@/lib/core/ports/product.repository";
import { createProductAction, updateProductAction, previewSkuAction, checkSkuAvailableAction } from "@/lib/actions/admin/product-actions";
import { slugify } from "@/lib/utils/slug";
import { useToast } from "@/lib/context/ToastContext";

function TagListInput({ label, values, onChange, placeholder }: { label: string; values: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState("");
  const id = useId();

  function add() {
    const v = draft.trim();
    if (!v || values.includes(v)) return;
    onChange([...values, v]);
    setDraft("");
  }

  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 text-xs font-semibold text-ink-soft">{label}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
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

/**
 * One row per size, sourced from the Sizes list above — sizes are added/removed
 * there, not here. Each row just carries that size's own price/MRP/stock; this
 * renders nothing when there are no sizes, so a single-price product's form
 * looks exactly as it did before this section existed.
 */
function VariantEditor({
  sizes,
  variants,
  onChange,
}: {
  sizes: string[];
  variants: VariantInput[];
  onChange: (v: VariantInput[]) => void;
}) {
  function variantFor(size: string): VariantInput {
    const key = size.trim().toLowerCase();
    return variants.find((v) => v.size.trim().toLowerCase() === key) ?? { size, price: 0, mrp: 0, stock: 0 };
  }

  function updateSize(size: string, patch: Partial<VariantInput>) {
    const key = size.trim().toLowerCase();
    const exists = variants.some((v) => v.size.trim().toLowerCase() === key);
    onChange(
      exists
        ? variants.map((v) => (v.size.trim().toLowerCase() === key ? { ...v, ...patch } : v))
        : [...variants, { ...variantFor(size), ...patch }]
    );
  }

  if (sizes.length === 0) return null;

  return (
    <div>
      <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Size Variants</Label>
      <p className="mb-2 text-xs text-muted">
        Each size needs its own price, MRP and stock — the customer picks a size on the product page and pays that
        size&apos;s price. Add or remove sizes above.
      </p>
      <div className="flex flex-col gap-3">
        {sizes.map((size) => {
          const variant = variantFor(size);
          return (
            <div key={size} className="rounded-lg border border-border p-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink">{size}</p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="mb-1 text-[10px] font-medium text-muted-soft">Price (₹)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={variant.price}
                    onChange={(e) => updateSize(size, { price: Number(e.target.value) })}
                    className="h-10"
                  />
                </div>
                <div>
                  <Label className="mb-1 text-[10px] font-medium text-muted-soft">MRP (₹)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={variant.mrp}
                    onChange={(e) => updateSize(size, { mrp: Number(e.target.value) })}
                    className="h-10"
                  />
                </div>
                <div>
                  <Label className="mb-1 text-[10px] font-medium text-muted-soft">Stock</Label>
                  <Input
                    type="number"
                    min={0}
                    value={variant.stock}
                    onChange={(e) => updateSize(size, { stock: Number(e.target.value) })}
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
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
  variants: [],
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
  const [skuTouched, setSkuTouched] = useState(Boolean(initial));
  const [skuError, setSkuError] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [isGeneratingSku, startSkuTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  const category = categories.find((c) => c.id === values.categoryId);
  const hasSizeVariants = values.sizes.length > 0;

  // While sizes exist, the top-level Price/MRP/Stock fields are disabled and
  // instead just preview a summary derived from the variants (lowest price,
  // lowest MRP, total stock) — this is what actually gets submitted for
  // those columns, so the admin list/detail views still show something
  // meaningful instead of stale or zeroed-out values.
  const derivedPrice = values.variants.length > 0 ? Math.min(...values.variants.map((v) => v.price)) : 0;
  const derivedMrp = values.variants.length > 0 ? Math.min(...values.variants.map((v) => v.mrp)) : 0;
  const derivedStock = values.variants.reduce((sum, v) => sum + (Number.isFinite(v.stock) ? v.stock : 0), 0);
  const displayPrice = hasSizeVariants ? derivedPrice : values.price;
  const displayMrp = hasSizeVariants ? derivedMrp : values.mrp;
  const displayStock = hasSizeVariants ? derivedStock : values.stock;

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  // The single place sizes are added/removed — keeps `variants` in lockstep:
  // a new size gets a blank price/MRP/stock row, a removed size loses its
  // row, and an existing size keeps whatever it already had. Case-insensitive
  // duplicates are rejected here since price/MRP/stock keys off size text.
  function handleSizesChange(newSizes: string[]) {
    const seen = new Set<string>();
    const deduped: string[] = [];
    let hadDuplicate = false;
    for (const s of newSizes) {
      const key = s.trim().toLowerCase();
      if (seen.has(key)) {
        hadDuplicate = true;
        continue;
      }
      seen.add(key);
      deduped.push(s);
    }
    setSizeError(hadDuplicate ? "Duplicate sizes aren't allowed — each size can only be added once." : null);
    setValues((v) => {
      const bySize = new Map(v.variants.map((variant) => [variant.size.trim().toLowerCase(), variant] as const));
      const nextVariants = deduped.map((size) => bySize.get(size.trim().toLowerCase()) ?? { size, price: 0, mrp: 0, stock: 0 });
      return { ...v, sizes: deduped, variants: nextVariants };
    });
  }

  // Auto-generates/refreshes the SKU from the slug while creating a new
  // product — stops the moment the admin edits the SKU field themselves, and
  // never runs at all when editing an existing product (its SKU is fixed).
  useEffect(() => {
    if (productId || skuTouched) return;
    const slug = values.slug.trim();
    if (!slug) return; // cleared synchronously by the change handlers below instead
    const handle = setTimeout(() => {
      startSkuTransition(async () => {
        const result = await previewSkuAction(slug);
        if (result.ok && result.data) set("sku", result.data.sku);
      });
    }, 350);
    return () => clearTimeout(handle);
  }, [values.slug, skuTouched, productId]);

  async function handleSkuBlur() {
    const sku = values.sku.trim();
    if (!sku) return;
    if (initial && sku === initial.sku) {
      setSkuError(null);
      return;
    }
    const result = await checkSkuAvailableAction(sku, productId);
    if (result.ok && result.data && !result.data.available) {
      setSkuError(`SKU "${sku}" is already in use.`);
    } else {
      setSkuError(null);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!hasSizeVariants && values.price > values.mrp) {
      setError("Price cannot be higher than MRP.");
      return;
    }

    if (values.description.replace(/<[^>]*>/g, "").trim().length === 0) {
      setError("Description is required.");
      return;
    }

    if (hasSizeVariants) {
      for (const size of values.sizes) {
        const variant = values.variants.find((v) => v.size.trim().toLowerCase() === size.trim().toLowerCase());
        const hasPrice = variant && Number.isFinite(variant.price) && variant.price > 0;
        const hasMrp = variant && Number.isFinite(variant.mrp) && variant.mrp > 0;
        const hasStock = variant && Number.isFinite(variant.stock) && variant.stock >= 0;
        if (!hasPrice || !hasMrp || !hasStock) {
          setError(`Please enter price, MRP and stock for ${size}.`);
          return;
        }
        if (variant.price > variant.mrp) {
          setError(`Price cannot be higher than MRP for ${size}.`);
          return;
        }
      }
    }

    startTransition(async () => {
      const payload: ProductFormValues = hasSizeVariants
        ? { ...values, price: displayPrice, mrp: displayMrp, stock: displayStock }
        : values;
      const result = productId
        ? await updateProductAction(productId, payload)
        : await createProductAction(payload, { autoSku: !skuTouched });
      if (!result.ok) {
        const message = result.error ?? (productId ? "Failed to update product" : "Failed to create product");
        setError(message);
        showToast(message, "error");
        return;
      }
      showToast(productId ? "Product updated successfully" : "Product created successfully", "success");
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
            <Label htmlFor="product-name" className="mb-1.5 text-xs font-semibold text-ink-soft">Name</Label>
            <Input
              id="product-name"
              required
              value={values.name}
              onChange={(e) => {
                set("name", e.target.value);
                if (!slugTouched) {
                  const newSlug = slugify(e.target.value);
                  set("slug", newSlug);
                  if (!skuTouched && !newSlug) set("sku", "");
                }
              }}
              className="h-10"
            />
          </div>
          <div>
            <Label htmlFor="product-slug" className="mb-1.5 text-xs font-semibold text-ink-soft">Slug</Label>
            <Input
              id="product-slug"
              required
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
                if (!skuTouched && !e.target.value.trim()) set("sku", "");
              }}
              className="h-10"
            />
          </div>
          <div>
            <Label htmlFor="product-sku" className="mb-1.5 text-xs font-semibold text-ink-soft">SKU</Label>
            <Input
              id="product-sku"
              required
              value={values.sku}
              onChange={(e) => {
                setSkuTouched(true);
                setSkuError(null);
                set("sku", e.target.value);
              }}
              onBlur={handleSkuBlur}
              className="h-10"
              aria-invalid={Boolean(skuError)}
            />
            {skuError ? (
              <p className="mt-1 text-xs font-medium text-signal">{skuError}</p>
            ) : !productId && !skuTouched ? (
              <p className="mt-1 text-xs text-muted">{isGeneratingSku ? "Generating…" : "Auto-generated from the slug — you can edit it."}</p>
            ) : null}
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="product-short-description" className="mb-1.5 text-xs font-semibold text-ink-soft">Short Description</Label>
            <Input id="product-short-description" required value={values.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} className="h-10" />
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-1.5 text-xs font-semibold text-ink-soft">Description</Label>
            <RichTextEditor
              value={values.description}
              onChange={(html) => set("description", html)}
              placeholder="Premium football training ball..."
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-5">
        <h2 className="font-display text-base font-bold text-ink">Categorization</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="product-category" className="mb-1.5 text-xs font-semibold text-ink-soft">Category</Label>
            <Select value={values.categoryId} onValueChange={(v) => setValues((s) => ({ ...s, categoryId: v, subcategoryId: null }))}>
              <SelectTrigger id="product-category" className="h-10 w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="product-subcategory" className="mb-1.5 text-xs font-semibold text-ink-soft">Subcategory</Label>
            <Select value={values.subcategoryId ?? "__none"} onValueChange={(v) => set("subcategoryId", v === "__none" ? null : v)}>
              <SelectTrigger id="product-subcategory" className="h-10 w-full"><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">None</SelectItem>
                {category?.subcategories.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="product-brand" className="mb-1.5 text-xs font-semibold text-ink-soft">Brand</Label>
            <Input id="product-brand" required value={values.brand} onChange={(e) => set("brand", e.target.value)} className="h-10" />
          </div>
          <div>
            <Label htmlFor="product-sport" className="mb-1.5 text-xs font-semibold text-ink-soft">Sport</Label>
            <Input id="product-sport" required value={values.sport} onChange={(e) => set("sport", e.target.value)} className="h-10" />
          </div>
          <div>
            <Label htmlFor="product-type" className="mb-1.5 text-xs font-semibold text-ink-soft">Product Type</Label>
            <Input id="product-type" required value={values.productType} onChange={(e) => set("productType", e.target.value)} className="h-10" />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-5">
        <h2 className="font-display text-base font-bold text-ink">Pricing & Stock</h2>
        {hasSizeVariants && (
          <p className="mt-1 text-xs text-muted">Pricing and stock are managed per size for this product.</p>
        )}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="product-price" className="mb-1.5 text-xs font-semibold text-ink-soft">Price (₹)</Label>
            <Input
              id="product-price"
              required={!hasSizeVariants}
              disabled={hasSizeVariants}
              readOnly={hasSizeVariants}
              type="number"
              min={0}
              step="0.01"
              value={displayPrice}
              onChange={(e) => set("price", Number(e.target.value))}
              className="h-10 disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-70"
            />
          </div>
          <div>
            <Label htmlFor="product-mrp" className="mb-1.5 text-xs font-semibold text-ink-soft">MRP (₹)</Label>
            <Input
              id="product-mrp"
              required={!hasSizeVariants}
              disabled={hasSizeVariants}
              readOnly={hasSizeVariants}
              type="number"
              min={0}
              step="0.01"
              value={displayMrp}
              onChange={(e) => set("mrp", Number(e.target.value))}
              className="h-10 disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-70"
            />
          </div>
          <div>
            <Label htmlFor="product-stock" className="mb-1.5 text-xs font-semibold text-ink-soft">Stock</Label>
            <Input
              id="product-stock"
              required={!hasSizeVariants}
              disabled={hasSizeVariants}
              readOnly={hasSizeVariants}
              type="number"
              min={0}
              value={displayStock}
              onChange={(e) => set("stock", Number(e.target.value))}
              className="h-10 disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-70"
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-5">
        <h2 className="font-display text-base font-bold text-ink">Variants & Highlights</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <TagListInput label="Sizes" values={values.sizes} onChange={handleSizesChange} placeholder="e.g. M, L, XL" />
            {sizeError && <p className="mt-1.5 text-xs font-medium text-signal">{sizeError}</p>}
          </div>
          <TagListInput label="Colors" values={values.colors} onChange={(v) => set("colors", v)} placeholder="e.g. Black, Red" />
          <div className="sm:col-span-2">
            <TagListInput label="Highlights" values={values.highlights} onChange={(v) => set("highlights", v)} placeholder="e.g. Sweat-wicking fabric" />
          </div>
        </div>

        <div className="mt-5">
          <VariantEditor sizes={values.sizes} variants={values.variants} onChange={(v) => set("variants", v)} />
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
            <Label htmlFor="product-seo-title" className="mb-1.5 text-xs font-semibold text-ink-soft">SEO Title</Label>
            <Input id="product-seo-title" value={values.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} className="h-10" />
          </div>
          <div>
            <Label htmlFor="product-seo-description" className="mb-1.5 text-xs font-semibold text-ink-soft">SEO Description</Label>
            <Textarea id="product-seo-description" rows={2} value={values.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} />
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isPending} className="h-11 rounded-full px-8 text-sm font-bold">
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? (productId ? "Saving…" : "Creating…") : productId ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
