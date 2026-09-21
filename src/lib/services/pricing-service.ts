import "server-only";
import type { Product } from "@/lib/types";
import { applyOfferPricingToProduct, applyOfferPricingToProducts } from "@/lib/utils/offers";
import { getStorefrontOffers } from "@/lib/services/offer-service";

/** Overlay live category-offer pricing onto catalog products without writing `products.price`. */
export async function withOfferPricing(products: Product[]): Promise<Product[]> {
  if (products.length === 0) return products;
  const offers = await getStorefrontOffers();
  if (offers.length === 0) return products;
  return applyOfferPricingToProducts(products, offers);
}

export async function withOfferPricingOne(product: Product | undefined): Promise<Product | undefined> {
  if (!product) return undefined;
  const offers = await getStorefrontOffers();
  if (offers.length === 0) return product;
  return applyOfferPricingToProduct(product, offers);
}
