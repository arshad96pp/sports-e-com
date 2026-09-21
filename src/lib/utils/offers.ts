import type { OfferDTO } from "@/lib/core/ports/offer.repository";

const DATE_ONLY = /^(\d{4}-\d{2}-\d{2})$/;

export interface OfferCategoryRef {
  slug: string;
  name: string;
  shortName: string;
}

export interface StorefrontOfferCard {
  key: string;
  slug: string;
  title: string;
  categoryLabel: string;
  discountPercent: number;
  description: string;
  href: string;
  ctaLabel: string;
}

export interface OfferAnnouncementItem {
  id: string;
  discountPercent: number;
  label: string;
  href: string;
}

/**
 * Parse an offer bound as an absolute instant so comparisons are timezone-safe.
 * Date-only values (`YYYY-MM-DD`) are treated as the UTC start or end of that day,
 * matching how the admin form persists start/end timestamps.
 */
export function parseOfferBound(value: string, bound: "start" | "end"): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (DATE_ONLY.test(trimmed)) {
    const iso = bound === "start" ? `${trimmed}T00:00:00.000Z` : `${trimmed}T23:59:59.999Z`;
    const t = Date.parse(iso);
    return Number.isNaN(t) ? null : t;
  }

  const t = Date.parse(trimmed);
  return Number.isNaN(t) ? null : t;
}

export function isOfferWithinDateRange(
  offer: Pick<OfferDTO, "startDate" | "endDate">,
  now: Date = new Date()
): boolean {
  const start = parseOfferBound(offer.startDate, "start");
  const end = parseOfferBound(offer.endDate, "end");
  if (start === null || end === null || end < start) return false;
  const t = now.getTime();
  return t >= start && t <= end;
}

export function hasApplicableCategories(offer: Pick<OfferDTO, "categorySlugs">): boolean {
  return offer.categorySlugs.length > 0;
}

export function isStorefrontOffer(offer: OfferDTO, now: Date = new Date()): boolean {
  return offer.isActive && isOfferWithinDateRange(offer, now) && hasApplicableCategories(offer);
}

export function filterStorefrontOffers(offers: OfferDTO[], now: Date = new Date()): OfferDTO[] {
  return offers.filter((offer) => isStorefrontOffer(offer, now));
}

export function offerAppliesToCategory(offer: Pick<OfferDTO, "categorySlugs">, slug: string): boolean {
  return offer.categorySlugs.includes(slug);
}

export function pickBestOfferForCategory(offers: OfferDTO[], slug: string): OfferDTO | undefined {
  return offers
    .filter((offer) => offerAppliesToCategory(offer, slug))
    .sort((a, b) => b.discountPercent - a.discountPercent)[0];
}

/**
 * Selling-price rule (storefront + checkout must match):
 * - Apply the single highest `discount_percent` among live offers for the
 *   product's category. Offers never stack.
 * - The percent is taken off the catalog selling price (`products.price`),
 *   not MRP. Catalog `price` / `mrp` rows are never written.
 * - When the offer ends or is deactivated, reads fall back to catalog price.
 */
export function discountedSellingPrice(price: number, discountPercent: number): number {
  if (discountPercent <= 0) return price;
  if (discountPercent >= 100) return 0;
  return Math.round(((price * (100 - discountPercent)) / 100) * 100) / 100;
}

export function applyOfferPricingToProduct<T extends { price: number; mrp: number; category: string }>(
  product: T,
  offers: OfferDTO[]
): T {
  const offer = pickBestOfferForCategory(offers, product.category);
  if (!offer) return product;
  const nextPrice = discountedSellingPrice(product.price, offer.discountPercent);
  if (nextPrice >= product.price) return product;
  // Compare-at becomes the pre-offer selling price so the % OFF label matches
  // the offer (not a stacked MRP markdown). Catalog rows are unchanged.
  return { ...product, price: nextPrice, mrp: product.price };
}

export function applyOfferPricingToProducts<T extends { price: number; mrp: number; category: string }>(
  products: T[],
  offers: OfferDTO[]
): T[] {
  if (offers.length === 0) return products;
  return products.map((product) => applyOfferPricingToProduct(product, offers));
}

export function offerShopHref(offer: Pick<OfferDTO, "categorySlugs">): string {
  if (offer.categorySlugs.length === 1) return `/category/${offer.categorySlugs[0]}`;
  return "/products";
}

export function categoryOfferMessage(offer: Pick<OfferDTO, "discountPercent">, categoryName: string): string {
  return `${offer.discountPercent}% OFF selected ${categoryName.toLowerCase()}`;
}

export function toAnnouncementItems(offers: OfferDTO[]): OfferAnnouncementItem[] {
  return offers.map((offer) => ({
    id: offer.id,
    discountPercent: offer.discountPercent,
    label: offer.title.trim(),
    href: offerShopHref(offer),
  }));
}

export function toStorefrontOfferCards(
  offers: OfferDTO[],
  categories: OfferCategoryRef[]
): StorefrontOfferCard[] {
  const bySlug = new Map(categories.map((category) => [category.slug, category]));
  const bestBySlug = new Map<string, OfferDTO>();

  for (const offer of offers) {
    for (const slug of offer.categorySlugs) {
      if (!bySlug.has(slug)) continue;
      const current = bestBySlug.get(slug);
      if (!current || offer.discountPercent > current.discountPercent) {
        bestBySlug.set(slug, offer);
      }
    }
  }

  const cards: StorefrontOfferCard[] = [];
  for (const category of categories) {
    const offer = bestBySlug.get(category.slug);
    if (!offer) continue;
    const description = offer.description.trim() || `Selected ${category.name.toLowerCase()}`;
    const shopLabel = category.shortName || category.name;
    cards.push({
      key: `${offer.id}-${category.slug}`,
      slug: category.slug,
      title: offer.title.trim() || categoryOfferMessage(offer, category.name),
      categoryLabel: shopLabel,
      discountPercent: offer.discountPercent,
      description,
      href: `/category/${category.slug}`,
      ctaLabel: `Shop ${shopLabel}`,
    });
  }

  return cards;
}
