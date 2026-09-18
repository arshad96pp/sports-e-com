import { z } from "zod";

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
  subject: requiredText().pipe(
    z.string().min(2, "Enter a topic or subject").max(160, "Subject is too long")
  ),
  message: requiredText().pipe(
    z.string().min(10, "Tell us a bit more about your inquiry").max(4000, "Message is too long")
  ),
  // Hidden honeypot field — deliberately named/labeled to avoid matching any
  // browser autofill heuristic (e.g. "company"/"organization" gets silently
  // autofilled by Chrome's saved address profiles even with autocomplete=off).
  hp_topic: requiredText().pipe(z.string().max(200)),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
