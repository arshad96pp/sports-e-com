import { PolicyLayout } from "@/components/common/PolicyLayout";
import { STORE } from "@/lib/config";

export const metadata = {
  title: "Privacy Policy",
  description: `How ${STORE.name} collects, uses and protects your personal information.`,
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout title="Privacy Policy">
      <p>
        {STORE.name} respects your privacy. This policy explains what information we collect and
        how it is used.
      </p>
      <h2>Information We Collect</h2>
      <ul>
        <li>Contact details you provide (name, phone, email, delivery address)</li>
        <li>Cart and wishlist preferences stored on your device</li>
      </ul>
      <h2>How We Use Your Information</h2>
      <p>Your information is used solely to process orders, communicate order updates via WhatsApp, and improve your shopping experience.</p>
      <h2>Data Storage</h2>
      <p>Account, cart and wishlist data on this site are stored locally in your browser. We do not sell your personal information to third parties.</p>
      <h2>Contact Us</h2>
      <p>For any privacy-related questions, reach out to us at {STORE.supportEmail}.</p>
    </PolicyLayout>
  );
}
