"use client";

import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { deleteProductAction } from "@/lib/actions/admin/product-actions";

export function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  return <ConfirmDeleteButton itemLabel={productName} entityName="product" onConfirm={() => deleteProductAction(productId)} />;
}
