import { getBestSellers } from "@/lib/repositories/product-repository";
import { ProductCarousel } from "@/components/product/ProductCarousel";

export async function BestSellers() {
  const products = await getBestSellers();

  return (
    <section className="border-y border-border bg-surface py-12 sm:py-16">
      <div className="container-app">
        <div className="mb-6">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Best Sellers
          </h2>
          <p className="mt-1.5 text-sm text-muted">Most-loved gear across every sport.</p>
        </div>
        <ProductCarousel products={products} />
      </div>
    </section>
  );
}
