"use client";

import {
  DISCOUNT_BUCKETS,
  RATING_BUCKETS,
  type FilterState,
  type PriceBounds,
} from "@/lib/hooks/useProductFilters";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PriceRangeFilter } from "@/components/filters/PriceRangeFilter";

interface FilterPanelProps {
  filters: FilterState;
  priceBounds: PriceBounds;
  options: {
    subcategories: string[];
    brands: string[];
    sports: string[];
    productTypes: string[];
    colors: string[];
    sizes: string[];
  };
  actions: {
    setPriceRange: (range: PriceBounds | null) => void;
    toggleSubcategory: (value: string) => void;
    toggleBrand: (value: string) => void;
    toggleSport: (value: string) => void;
    toggleProductType: (value: string) => void;
    toggleColor: (value: string) => void;
    toggleSize: (value: string) => void;
    toggleRating: (value: number) => void;
    toggleDiscount: (value: number) => void;
    toggleInStockOnly: () => void;
  };
  showSubcategory?: boolean;
}

function CheckRow({ id, label, checked, onCheckedChange }: { id: string; label: string; checked: boolean; onCheckedChange: () => void }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <Label htmlFor={id} className={`tap-target flex-1 cursor-pointer text-sm font-normal ${checked ? "font-medium text-ink" : "text-ink-soft"}`}>
        {label}
      </Label>
    </div>
  );
}

export function FilterPanel({ filters, priceBounds, options, actions, showSubcategory = true }: FilterPanelProps) {
  return (
    <Accordion type="multiple" defaultValue={[]}>
      <AccordionItem value="price">
        <AccordionTrigger className="text-xs font-bold uppercase tracking-wide text-ink hover:no-underline">
          Price
        </AccordionTrigger>
        <AccordionContent>
          <PriceRangeFilter bounds={priceBounds} value={filters.priceRange} onChange={actions.setPriceRange} />
        </AccordionContent>
      </AccordionItem>

      {showSubcategory && options.subcategories.length > 1 && (
        <AccordionItem value="category">
          <AccordionTrigger className="text-xs font-bold uppercase tracking-wide text-ink hover:no-underline">
            Category
          </AccordionTrigger>
          <AccordionContent>
            {options.subcategories.map((sub) => (
              <CheckRow
                key={sub}
                id={`sub-${sub}`}
                label={sub}
                checked={filters.subcategories.includes(sub)}
                onCheckedChange={() => actions.toggleSubcategory(sub)}
              />
            ))}
          </AccordionContent>
        </AccordionItem>
      )}

      {options.sports.length > 1 && (
        <AccordionItem value="sport">
          <AccordionTrigger className="text-xs font-bold uppercase tracking-wide text-ink hover:no-underline">
            Sport
          </AccordionTrigger>
          <AccordionContent>
            {options.sports.map((sport) => (
              <CheckRow
                key={sport}
                id={`sport-${sport}`}
                label={sport}
                checked={filters.sports.includes(sport)}
                onCheckedChange={() => actions.toggleSport(sport)}
              />
            ))}
          </AccordionContent>
        </AccordionItem>
      )}

      <AccordionItem value="brand">
        <AccordionTrigger className="text-xs font-bold uppercase tracking-wide text-ink hover:no-underline">
          Brand
        </AccordionTrigger>
        <AccordionContent>
          {options.brands.map((brand) => (
            <CheckRow
              key={brand}
              id={`brand-${brand}`}
              label={brand}
              checked={filters.brands.includes(brand)}
              onCheckedChange={() => actions.toggleBrand(brand)}
            />
          ))}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="product-type">
        <AccordionTrigger className="text-xs font-bold uppercase tracking-wide text-ink hover:no-underline">
          Product Type
        </AccordionTrigger>
        <AccordionContent>
          {options.productTypes.map((type) => (
            <CheckRow
              key={type}
              id={`type-${type}`}
              label={type}
              checked={filters.productTypes.includes(type)}
              onCheckedChange={() => actions.toggleProductType(type)}
            />
          ))}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="rating">
        <AccordionTrigger className="text-xs font-bold uppercase tracking-wide text-ink hover:no-underline">
          Rating
        </AccordionTrigger>
        <AccordionContent>
          {RATING_BUCKETS.map((r) => (
            <CheckRow
              key={r}
              id={`rating-${r}`}
              label={`${r}★ & above`}
              checked={filters.ratings.includes(r)}
              onCheckedChange={() => actions.toggleRating(r)}
            />
          ))}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="discount">
        <AccordionTrigger className="text-xs font-bold uppercase tracking-wide text-ink hover:no-underline">
          Discount
        </AccordionTrigger>
        <AccordionContent>
          {DISCOUNT_BUCKETS.map((d) => (
            <CheckRow
              key={d}
              id={`discount-${d}`}
              label={`${d}% or more`}
              checked={filters.discounts.includes(d)}
              onCheckedChange={() => actions.toggleDiscount(d)}
            />
          ))}
        </AccordionContent>
      </AccordionItem>

      {options.colors.length > 1 && (
        <AccordionItem value="color">
          <AccordionTrigger className="text-xs font-bold uppercase tracking-wide text-ink hover:no-underline">
            Color
          </AccordionTrigger>
          <AccordionContent>
            {options.colors.map((color) => (
              <CheckRow
                key={color}
                id={`color-${color}`}
                label={color}
                checked={filters.colors.includes(color)}
                onCheckedChange={() => actions.toggleColor(color)}
              />
            ))}
          </AccordionContent>
        </AccordionItem>
      )}

      {options.sizes.length > 1 && (
        <AccordionItem value="size">
          <AccordionTrigger className="text-xs font-bold uppercase tracking-wide text-ink hover:no-underline">
            Size
          </AccordionTrigger>
          <AccordionContent>
            {options.sizes.map((size) => (
              <CheckRow
                key={size}
                id={`size-${size}`}
                label={size}
                checked={filters.sizes.includes(size)}
                onCheckedChange={() => actions.toggleSize(size)}
              />
            ))}
          </AccordionContent>
        </AccordionItem>
      )}

      <AccordionItem value="availability">
        <AccordionTrigger className="text-xs font-bold uppercase tracking-wide text-ink hover:no-underline">
          Availability
        </AccordionTrigger>
        <AccordionContent>
          <CheckRow
            id="in-stock-only"
            label="In Stock Only"
            checked={filters.inStockOnly}
            onCheckedChange={actions.toggleInStockOnly}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
