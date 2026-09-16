import { PolicyLayout } from "@/components/common/PolicyLayout";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/config";
import { formatPrice } from "@/lib/utils/format";

export const metadata = {
  title: "Shipping Policy",
  description: "Delivery timelines, shipping charges and serviceable areas for STRYDE orders.",
  alternates: { canonical: "/shipping-policy" },
};

export default function ShippingPolicyPage() {
  return (
    <PolicyLayout title="Shipping Policy">
      <p>We aim to get your gear to you as quickly and safely as possible.</p>
      <h2>Delivery Timelines</h2>
      <p>Orders are typically dispatched within 24-48 hours and delivered within 3-5 business days, depending on your location.</p>
      <h2>Shipping Charges</h2>
      <ul>
        <li>Free delivery on orders above {formatPrice(FREE_SHIPPING_THRESHOLD)}</li>
        <li>A flat shipping fee applies to orders below this amount</li>
      </ul>
      <h2>Order Tracking</h2>
      <p>Since orders are confirmed via WhatsApp, our team will share tracking updates directly on WhatsApp once your order ships.</p>
      <h2>Serviceable Areas</h2>
      <p>We currently ship across India. For international shipping enquiries, please contact our support team.</p>
    </PolicyLayout>
  );
}
