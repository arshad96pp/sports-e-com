import type { Metadata } from "next";
import { ResetPasswordClient } from "@/components/auth/ResetPasswordClient";
import { STORE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Set New Password",
  description: `Set a new password for your ${STORE.name} account.`,
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
