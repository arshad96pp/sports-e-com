import { PackageSearch } from "lucide-react";
import { getFeaturedProducts } from "@/lib/repositories/product-repository";
import { HomeSectionHeader, ViewAllLink } from "@/components/home/HomeSectionHeader";
import { HomeProductRail } from "@/components/home/HomeProductRail";
import { EmptyState } from "@/components/common/EmptyState";
import type { Product } from "@/lib/types";

export async function FeaturedProducts() {
  let products: Product[] = [];
  try {
    products = await getFeaturedProducts(4);
  } catch (error) {
    console.error("Failed to load featured products:", error);
  }

  // This is the homepage's primary product showcase, so an empty/failed
  // fetch gets an intentional empty state instead of hiding the section —
  // unlike the secondary rails (best sellers, deals) which hide gracefully.
  return (
    <section className="container-app py-12 sm:py-16 lg:py-20">
      <HomeSectionHeader
        title="Featured gear"
        description="Popular picks for football, cricket, tennis and more."
        action={products.length > 0 ? <ViewAllLink href="/products?featured=true" /> : undefined}
      />
      {products.length > 0 ? (
        <HomeProductRail products={products} priorityCount={1} />
      ) : (
        <div className="mt-8">
          <EmptyState
            icon={PackageSearch}
            title="No products available right now"
            description="We're restocking. Check back soon, or browse the full catalog."
            ctaLabel="Browse all products"
            ctaHref="/products"
          />
        </div>
      )}
    </section>
  );
}
