import { getDealProducts } from "@/lib/repositories/product-repository";
import { HomeSectionHeader, ViewAllLink } from "@/components/home/HomeSectionHeader";
import { HomeProductRail } from "@/components/home/HomeProductRail";

export async function OffersSection() {
  const products = await getDealProducts(4);
  if (products.length === 0) return null;

  return (
    <section className="bg-surface py-12 sm:py-16 lg:py-20">
      <div className="container-app">
        <HomeSectionHeader
          title="Special picks"
          description="Selected gear. Better prices."
          action={<ViewAllLink href="/products?deal=true" label="View all deals" />}
        />
        <HomeProductRail products={products} />
      </div>
    </section>
  );
}
