import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getFeaturedProducts } from "@/lib/repositories/product-repository";
import { ProductGrid } from "@/components/product/ProductGrid";

export async function FeaturedProducts() {
  const products = await getFeaturedProducts(8);

  return (
    <section className="container-app py-12 sm:py-16">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Featured Products
          </h2>
          <p className="mt-1.5 text-sm text-muted">Hand-picked gear our athletes love.</p>
        </div>
        <Link
          href="/category/football"
          className="hidden items-center gap-1 text-sm font-semibold text-ink sm:flex"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <ProductGrid products={products} />
    </section>
  );
}
