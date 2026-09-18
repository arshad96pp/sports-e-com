import { getBestSellers } from "@/lib/repositories/product-repository";
import { ProductCarousel } from "@/components/product/ProductCarousel";

export async function BestSellers() {
  const products = await getBestSellers();
  if (products.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container-app">
        <ProductCarousel
          products={products}
          title="Best sellers"
          description="Popular gear chosen for your next game."
          viewAllHref="/category/football"
        />
      </div>
    </section>
  );
}
