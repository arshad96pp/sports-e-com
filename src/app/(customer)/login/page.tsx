import type { Metadata } from "next";
import { LoginPageClient } from "@/components/auth/LoginPageClient";

export const metadata: Metadata = {
  title: "Login",
  description: "Log in to your STRYDE account to track orders, manage your wishlist and check out faster.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return <LoginPageClient />;
}
