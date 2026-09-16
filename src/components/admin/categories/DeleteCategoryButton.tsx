"use client";

import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { deleteCategoryAction } from "@/lib/actions/admin/category-actions";

export function DeleteCategoryButton({ categoryId, categoryName }: { categoryId: string; categoryName: string }) {
  return <ConfirmDeleteButton itemLabel={categoryName} onConfirm={() => deleteCategoryAction(categoryId)} />;
}
