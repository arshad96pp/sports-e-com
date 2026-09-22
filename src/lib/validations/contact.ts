import { z } from "zod";
import { normalizeIndianPhone } from "@/lib/utils/phone";

// Coerces a missing/non-string field to "" so it fails our own min-length
// message below instead of zod's raw "expected string, received undefined".
const requiredText = () =>
  z
    .string()
    .catch("")
    .transform((v) => v.trim());

export const contactFormSchema = z.object({
  name: requiredText().pipe(z.string().min(2, "Enter your full name").max(120, "Full name is too long")),
  email: requiredText().pipe(z.string().toLowerCase().max(254).email("Enter a valid email")),
  // The form only collects the 10-digit local number (the +91 prefix is
  // fixed in the UI, not user-editable) but normalizeIndianPhone also
  // tolerates an accidentally-included +91/91 prefix so it never produces a
  // doubled-up "+91+91…" value.
  phone: requiredText()
    .transform((v) => normalizeIndianPhone(v))
    .pipe(z.string({ error: "Enter a valid 10-digit mobile number" })),
  message: requiredText().pipe(
    z.string().min(10, "Tell us a bit more about your inquiry").max(4000, "Message is too long")
  ),
  // Hidden honeypot field — deliberately named/labeled to avoid matching any
  // browser autofill heuristic (e.g. "company"/"organization" gets silently
  // autofilled by Chrome's saved address profiles even with autocomplete=off).
  hp_topic: requiredText().pipe(z.string().max(200)),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
