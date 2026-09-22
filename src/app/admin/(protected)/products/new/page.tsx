import type { Metadata } from "next";
import { listCategoriesForAdmin } from "@/lib/services/admin-category-service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/products/ProductForm";

export const metadata: Metadata = { title: "New Product" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await listCategoriesForAdmin();

  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        title="New Product"
        description="SKU is generated automatically from the slug — edit it if you need a custom value. Images can be added after the product is created."
      />
      <ProductForm key="new" categories={categories} />
    </div>
  );
}
