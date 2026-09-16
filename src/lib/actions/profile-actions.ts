"use server";

import { getCurrentUser } from "@/lib/auth/session";
import type { UserProfile } from "@/lib/types";

export async function getMyProfileAction(): Promise<UserProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return { fullName: user.fullName, email: user.email, phone: user.phone ?? "" };
}
