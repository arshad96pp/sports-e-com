import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductForAdmin } from "@/lib/services/admin-product-service";
import { listCategoriesForAdmin } from "@/lib/services/admin-category-service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { ProductImageManager } from "@/components/admin/products/ProductImageManager";

export const metadata: Metadata = { title: "Edit Product" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProductForAdmin(id), listCategoriesForAdmin()]);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader title={product.name} description={`SKU ${product.sku}`} />
      <div className="mb-6">
        <ProductImageManager productId={id} initialImages={product.images.map((i) => ({ id: i.id, url: i.url }))} />
      </div>
      <ProductForm key={id} categories={categories} productId={id} initial={product} />
    </div>
  );
}
