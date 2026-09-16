import type { Metadata } from "next";
import { listCategoriesForAdmin } from "@/lib/services/admin-category-service";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SubcategoryFormDialog } from "@/components/admin/categories/SubcategoryFormDialog";
import { DeleteSubcategoryButton } from "@/components/admin/categories/DeleteSubcategoryButton";

export const metadata: Metadata = { title: "Subcategories" };
export const dynamic = "force-dynamic";

export default async function AdminSubcategoriesPage() {
  const categories = await listCategoriesForAdmin();
  const subcategories = categories.flatMap((c) => c.subcategories);

  return (
    <div>
      <AdminPageHeader
        title="Subcategories"
        description="Grouped under a parent category."
        actions={<SubcategoryFormDialog categories={categories} />}
      />

      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subcategory</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subcategories.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="text-sm font-medium text-ink">{s.name}</TableCell>
                <TableCell className="text-sm text-ink-soft">{s.categoryName}</TableCell>
                <TableCell className="text-sm text-muted">{s.slug}</TableCell>
                <TableCell className="text-sm">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.isActive ? "bg-success-soft text-success" : "bg-surface-strong text-muted"}`}>
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <SubcategoryFormDialog categories={categories} subcategory={s} />
                    <DeleteSubcategoryButton subcategoryId={s.id} subcategoryName={s.name} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {subcategories.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted">No subcategories yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
