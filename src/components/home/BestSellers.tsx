import { getBestSellers } from "@/lib/repositories/product-repository";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import type { Product } from "@/lib/types";

export async function BestSellers() {
  let products: Product[] = [];
  try {
    products = await getBestSellers();
  } catch (error) {
    console.error("Failed to load best sellers:", error);
  }
  // Secondary curated rail — hides gracefully rather than showing an empty state.
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
