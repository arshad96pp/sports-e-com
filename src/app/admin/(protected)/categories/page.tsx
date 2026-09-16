import type { Metadata } from "next";
import Image from "next/image";
import { listCategoriesForAdmin } from "@/lib/services/admin-category-service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CategoryFormDialog } from "@/components/admin/categories/CategoryFormDialog";
import { DeleteCategoryButton } from "@/components/admin/categories/DeleteCategoryButton";

export const metadata: Metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await listCategoriesForAdmin();

  return (
    <div>
      <AdminPageHeader title="Categories" description="Database-driven — changes reflect on the storefront immediately." actions={<CategoryFormDialog />} />

      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Subcategories</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface">
                      {c.imageUrl && <Image src={c.imageUrl} alt="" fill sizes="40px" className="object-cover" />}
                    </div>
                    <span className="text-sm font-medium text-ink">{c.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted">{c.slug}</TableCell>
                <TableCell className="text-sm text-ink-soft">{c.subcategories.length}</TableCell>
                <TableCell className="text-sm">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.isActive ? "bg-success-soft text-success" : "bg-surface-strong text-muted"}`}>
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <CategoryFormDialog category={c} />
                    <DeleteCategoryButton categoryId={c.id} categoryName={c.name} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
