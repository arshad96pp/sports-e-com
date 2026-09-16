import { PolicyLayout } from "@/components/common/PolicyLayout";
import { STORE } from "@/lib/config";

export const metadata = {
  title: "About Us",
  description: `Learn about ${STORE.name} — premium football, cricket, tennis and multi-sport accessories built for every athlete.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <PolicyLayout title="About Us">
      <p>
        {STORE.name} was built for athletes who take their game seriously — whether that&apos;s a
        weekend football match, nets practice, or a competitive tennis league.
      </p>
      <h2>Our Mission</h2>
      <p>We curate premium football, cricket, tennis and multi-sport accessories that perform as hard as you do, at prices that make sense.</p>
      <h2>Quality First</h2>
      <p>Every product on {STORE.name} is selected for durability, performance and value — because your gear should never let you down mid-game.</p>
      <h2>Personal Service</h2>
      <p>We keep checkout simple and personal — every order is confirmed directly with our team over WhatsApp, so you always know exactly where your order stands.</p>
    </PolicyLayout>
  );
}
