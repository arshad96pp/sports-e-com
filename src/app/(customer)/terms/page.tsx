import { PolicyLayout } from "@/components/common/PolicyLayout";
import { STORE } from "@/lib/config";

export const metadata = {
  title: "Terms & Conditions",
  description: `The terms and conditions governing your use of ${STORE.name} and its WhatsApp-based ordering process.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <PolicyLayout title="Terms & Conditions">
      <p>By using the {STORE.name} website, you agree to the following terms.</p>
      <h2>Orders</h2>
      <p>All orders are confirmed manually via WhatsApp with our team. Placing an order on the website does not guarantee stock availability until confirmed.</p>
      <h2>Pricing</h2>
      <p>Prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to update pricing at any time.</p>
      <h2>Product Information</h2>
      <p>We strive for accuracy in product descriptions and images, but minor variations may occur.</p>
      <h2>Limitation of Liability</h2>
      <p>{STORE.name} is not liable for indirect or incidental damages arising from the use of our products or website.</p>
    </PolicyLayout>
  );
}
