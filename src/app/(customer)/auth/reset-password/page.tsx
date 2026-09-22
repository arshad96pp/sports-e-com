import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ResetPasswordClient, type ResetLinkReason } from "@/components/auth/ResetPasswordClient";
import { PASSWORD_RECOVERY_COOKIE } from "@/lib/auth/password-recovery";
import { STORE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Set New Password",
  description: `Set a new password for your ${STORE.name} account.`,
  robots: { index: false, follow: false },
};

function parseReason(value: string | undefined): ResetLinkReason | undefined {
  if (value === "missing" || value === "expired" || value === "invalid") return value;
  return undefined;
}

export default async function ResetPasswordPage({ searchParams }: PageProps<"/auth/reset-password">) {
  const sp = await searchParams;
  const reason = parseReason(typeof sp.reason === "string" ? sp.reason : undefined);
  const cookieStore = await cookies();
  const canReset = cookieStore.get(PASSWORD_RECOVERY_COOKIE)?.value === "1";

  return <ResetPasswordClient canReset={canReset} reason={reason} />;
}
