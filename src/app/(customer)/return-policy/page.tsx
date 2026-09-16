import { PolicyLayout } from "@/components/common/PolicyLayout";

export const metadata = {
  title: "Return Policy",
  description: "Our 7-day return window, non-returnable items and refund process explained.",
  alternates: { canonical: "/return-policy" },
};

export default function ReturnPolicyPage() {
  return (
    <PolicyLayout title="Return Policy">
      <p>Not the right fit? We make returns simple.</p>
      <h2>Return Window</h2>
      <p>Products can be returned within 7 days of delivery, provided they are unused, unwashed and in original packaging.</p>
      <h2>Non-Returnable Items</h2>
      <ul>
        <li>Innerwear, mouthguards and other hygiene-sensitive items</li>
        <li>Items marked as final sale</li>
      </ul>
      <h2>How to Initiate a Return</h2>
      <p>Message our support team on WhatsApp with your name, phone number and reason for return. We&apos;ll guide you through the pickup and refund process.</p>
      <h2>Refunds</h2>
      <p>Refunds are processed within 5-7 business days after the returned item passes quality inspection.</p>
    </PolicyLayout>
  );
}
