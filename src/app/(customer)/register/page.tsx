import type { Metadata } from "next";
import { RegisterPageClient } from "@/components/auth/RegisterPageClient";
import { STORE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Create Account",
  description: `Create a ${STORE.name} account to track orders, save addresses and manage your wishlist.`,
  alternates: { canonical: "/register" },
  robots: { index: false, follow: true },
};

export default function RegisterPage() {
  return <RegisterPageClient />;
}
