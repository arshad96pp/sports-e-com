import type { Metadata } from "next";
import { ForgotPasswordClient } from "@/components/auth/ForgotPasswordClient";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset the password for your STRYDE account.",
  alternates: { canonical: "/forgot-password" },
  robots: { index: false, follow: true },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
