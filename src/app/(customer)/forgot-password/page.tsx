import type { Metadata } from "next";
import { ForgotPasswordClient } from "@/components/auth/ForgotPasswordClient";
import { STORE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Reset Password",
  description: `Reset the password for your ${STORE.name} account.`,
  alternates: { canonical: "/forgot-password" },
  robots: { index: false, follow: true },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
