import type { Metadata } from "next";
import { LoginPageClient } from "@/components/auth/LoginPageClient";
import { STORE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Login",
  description: `Log in to your ${STORE.name} account to track orders, manage your wishlist and check out faster.`,
  alternates: { canonical: "/login" },
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return <LoginPageClient />;
}
