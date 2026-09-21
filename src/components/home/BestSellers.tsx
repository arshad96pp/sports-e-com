import { getBestSellers } from "@/lib/repositories/product-repository";
import { ProductCarousel } from "@/components/product/ProductCarousel";

export async function BestSellers() {
  const products = await getBestSellers();
  if (products.length === 0) return null;

  return (
    <section className="pt-8 pb-12 sm:pt-10 sm:pb-16 lg:pt-10 lg:pb-20">
      <div className="container-app">
        <ProductCarousel
          products={products}
          title="Best sellers"
          description="Popular gear chosen for your next game."
          viewAllHref="/products?bestSeller=true"
        />
      </div>
    </section>
  );
}
