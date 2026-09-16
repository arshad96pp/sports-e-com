import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { Plus, Pencil } from "lucide-react";
import { listProductsForAdmin } from "@/lib/services/admin-product-service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice } from "@/lib/utils/format";
import { ProductActiveToggle } from "@/components/admin/products/ProductActiveToggle";
import { DeleteProductButton } from "@/components/admin/products/DeleteProductButton";

export const metadata: Metadata = { title: "Products" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await listProductsForAdmin();

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description={`${products.length} product${products.length === 1 ? "" : "s"} in the catalogue.`}
        actions={
          <Button asChild className="rounded-full">
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4" />
              New Product
            </Link>
          </Button>
        }
      />

      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface">
                      {p.thumbnailUrl && <Image src={p.thumbnailUrl} alt="" fill sizes="40px" className="object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                      <p className="truncate text-xs text-muted">{p.sku}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-ink-soft">{p.categoryName}</TableCell>
                <TableCell className="text-sm text-ink-soft">
                  {formatPrice(p.price)} <span className="text-muted-soft line-through">{formatPrice(p.mrp)}</span>
                </TableCell>
                <TableCell className={`text-sm ${p.stock === 0 ? "font-semibold text-signal" : "text-ink-soft"}`}>{p.stock}</TableCell>
                <TableCell>
                  <ProductActiveToggle productId={p.id} isActive={p.isActive} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button asChild variant="outline" size="icon-sm">
                      <Link href={`/admin/products/${p.id}/edit`} aria-label={`Edit ${p.name}`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <DeleteProductButton productId={p.id} productName={p.name} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted">
                  No products yet. Create your first one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
