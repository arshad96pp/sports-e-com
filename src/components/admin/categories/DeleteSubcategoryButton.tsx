"use client";

import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { deleteSubcategoryAction } from "@/lib/actions/admin/category-actions";

export function DeleteSubcategoryButton({ subcategoryId, subcategoryName }: { subcategoryId: string; subcategoryName: string }) {
  return <ConfirmDeleteButton itemLabel={subcategoryName} entityName="subcategory" onConfirm={() => deleteSubcategoryAction(subcategoryId)} />;
}
