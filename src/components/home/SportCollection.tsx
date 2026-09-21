import { getFeaturedProducts, getProductsByCategory } from "@/lib/repositories/product-repository";
import { HomeSectionHeader, ViewAllLink } from "@/components/home/HomeSectionHeader";
import { HomeProductRail } from "@/components/home/HomeProductRail";
import type { Product } from "@/lib/types";

export async function SportCollection() {
  let products: Product[] = [];
  try {
    const [featured, football] = await Promise.all([
      getFeaturedProducts(4),
      getProductsByCategory("football"),
    ]);
    const featuredIds = new Set(featured.map((p) => p.id));
    const unique = football.filter((p) => !featuredIds.has(p.id));
    products = (unique.length >= 4 ? unique : football).slice(0, 4);
  } catch (error) {
    console.error("Failed to load football collection:", error);
  }
  // Secondary curated rail — hides gracefully rather than showing an empty state.
  if (products.length === 0) return null;

  return (
    <section className="container-app pt-12 pb-4 sm:pt-16 sm:pb-6 lg:pt-20 lg:pb-6">
      <HomeSectionHeader
        title="Shop Football"
        description="Essentials for training, matches and everyday play."
        action={<ViewAllLink href="/category/football" label="View Football" />}
      />
      <HomeProductRail products={products} />
    </section>
  );
}
