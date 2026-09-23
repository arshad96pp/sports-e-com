import type { Metadata } from "next";
import { listCategoriesForAdmin } from "@/lib/services/admin-category-service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CategoryFormDialog } from "@/components/admin/categories/CategoryFormDialog";
import { CategoryRow } from "@/components/admin/categories/CategoryRow";

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
              <CategoryRow key={c.id} category={c} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
