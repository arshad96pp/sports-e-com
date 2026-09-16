"use server";

import { revalidatePath } from "next/cache";
import { getSuperAdminOrNull } from "@/lib/auth/admin-guard";
import { setCustomerActive } from "@/lib/services/customer-service";
import type { ActionResult } from "@/lib/actions/admin/product-actions";

export async function setCustomerActiveAction(userId: string, isActive: boolean): Promise<ActionResult> {
  const admin = await getSuperAdminOrNull();
  if (!admin) return { ok: false, error: "Unauthorized" };

  await setCustomerActive(userId, isActive);
  revalidatePath("/admin/customers");
  return { ok: true };
}
