"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { getAuthSessionPort } from "@/lib/config/providers";
import { profileSchema } from "@/lib/validations/auth";
import type { ActionResult } from "@/lib/actions/address-actions";
import type { UserProfile } from "@/lib/types";

export async function getMyProfileAction(): Promise<UserProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return { fullName: user.fullName, email: user.email, phone: user.phone ?? "" };
}

export async function updateProfileAction(input: { fullName: string; phone: string }): Promise<ActionResult<UserProfile>> {
  const user = await getCurrentUser();
  if (!user || user.role !== "customer") return { ok: false, error: "You must be logged in." };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid profile" };
  }

  const phone = parsed.data.phone ?? "";
  await getAuthSessionPort().updateProfile(user.id, { fullName: parsed.data.fullName, phone });
  revalidatePath("/account");

  return { ok: true, data: { fullName: parsed.data.fullName, email: user.email, phone } };
}
