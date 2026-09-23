"use client";

import { useState } from "react";
import Image from "next/image";
import { TableCell, TableRow } from "@/components/ui/table";
import { CategoryFormDialog } from "@/components/admin/categories/CategoryFormDialog";
import { DeleteCategoryButton } from "@/components/admin/categories/DeleteCategoryButton";
import type { AdminCategory } from "@/lib/services/admin-category-service";

export function CategoryRow({ category }: { category: AdminCategory }) {
  const [imageUrl, setImageUrl] = useState(category.imageUrl);

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface">
            {imageUrl && <Image src={imageUrl} alt="" fill sizes="40px" className="object-cover" />}
          </div>
          <span className="text-sm font-medium text-ink">{category.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted">{category.slug}</TableCell>
      <TableCell className="text-sm text-ink-soft">{category.subcategories.length}</TableCell>
      <TableCell className="text-sm">
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${category.isActive ? "bg-success-soft text-success" : "bg-surface-strong text-muted"}`}>
          {category.isActive ? "Active" : "Inactive"}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1.5">
          <CategoryFormDialog category={category} onImageUploaded={setImageUrl} />
          <DeleteCategoryButton categoryId={category.id} categoryName={category.name} />
        </div>
      </TableCell>
    </TableRow>
  );
}
