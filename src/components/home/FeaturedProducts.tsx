import { getFeaturedProducts } from "@/lib/repositories/product-repository";
import { HomeSectionHeader, ViewAllLink } from "@/components/home/HomeSectionHeader";
import { HomeProductRail } from "@/components/home/HomeProductRail";

export async function FeaturedProducts() {
  const products = await getFeaturedProducts(4);
  if (products.length === 0) return null;

  return (
    <section className="container-app py-12 sm:py-16 lg:py-20">
      <HomeSectionHeader
        title="Featured gear"
        description="Popular picks for football, cricket, tennis and more."
        action={<ViewAllLink href="/products?featured=true" />}
      />
      <HomeProductRail products={products} priorityCount={1} />
    </section>
  );
}
