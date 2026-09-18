import { getFeaturedProducts, getProductsByCategory } from "@/lib/repositories/product-repository";
import { HomeSectionHeader, ViewAllLink } from "@/components/home/HomeSectionHeader";
import { HomeProductRail } from "@/components/home/HomeProductRail";

export async function SportCollection() {
  const [featured, football] = await Promise.all([
    getFeaturedProducts(4),
    getProductsByCategory("football"),
  ]);

  const featuredIds = new Set(featured.map((p) => p.id));
  const unique = football.filter((p) => !featuredIds.has(p.id));
  const products = (unique.length >= 4 ? unique : football).slice(0, 4);
  if (products.length === 0) return null;

  return (
    <section className="container-app py-12 sm:py-16 lg:py-20">
      <HomeSectionHeader
        title="Shop Football"
        description="Essentials for training, matches and everyday play."
        action={<ViewAllLink href="/category/football" label="View Football" />}
      />
      <HomeProductRail products={products} />
    </section>
  );
}
