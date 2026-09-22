"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/lib/context/ToastContext";
import { normalizeIndianPhone } from "@/lib/utils/phone";

const GENERIC_ERROR = "Something went wrong while sending your message. Please try again.";

const fieldClass =
  "h-10 rounded-none border-0 border-b border-border bg-transparent px-0 shadow-none focus-visible:border-ink focus-visible:ring-0";

const labelClass = "mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground";

interface FormState {
  name: string;
  email: string;
  phone: string;
  message: string;
  hp_topic: string;
}

const initialState: FormState = { name: "", email: "", phone: "", message: "", hp_topic: "" };

export function ContactForm() {
  const { showToast } = useToast();
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): string | null {
    if (!form.name.trim()) return "Enter your full name";
    if (form.name.trim().length > 120) return "Full name is too long";
    if (!form.email.trim()) return "Enter your email address";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Enter a valid email address";
    if (!normalizeIndianPhone(form.phone)) return "Enter a valid 10-digit mobile number";
    if (!form.message.trim()) return "Enter your inquiry details";
    if (form.message.trim().length < 10) return "Tell us a bit more about your inquiry";
    if (form.message.trim().length > 4000) return "Message is too long";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          message: form.message.trim(),
          hp_topic: form.hp_topic,
        }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setError((data && typeof data.error === "string" && data.error) || GENERIC_ERROR);
        return;
      }

      setForm(initialState);
      showToast("Message sent successfully", "success");
    } catch {
      setError(GENERIC_ERROR);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="rounded-[1.75rem] bg-white py-10 shadow-none ring-0 sm:py-12 [--card-spacing:--spacing(10)]">
      <CardContent>
        <form onSubmit={handleSubmit} noValidate method="post">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink">Send a message</p>

          <div className="absolute left-[-9999px]" aria-hidden="true">
            <Label htmlFor="contact-hp-topic">Leave this field blank</Label>
            <Input
              id="contact-hp-topic"
              name="contact-hp-topic"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.hp_topic}
              onChange={(e) => update("hp_topic", e.target.value)}
            />
          </div>

          <div className="mt-10 grid gap-10 sm:grid-cols-2">
            <div>
              <Label htmlFor="contact-name" className={labelClass}>
                Full name
              </Label>
              <Input
                id="contact-name"
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Your name"
                maxLength={120}
                required
                className={fieldClass}
              />
            </div>
            <div>
              <Label htmlFor="contact-phone" className={labelClass}>
                Phone number
              </Label>
              <div className="flex h-10 items-center gap-2 border-b border-border focus-within:border-ink">
                <span className="text-sm text-ink-soft">+91</span>
                <Input
                  id="contact-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="9876543210"
                  maxLength={10}
                  required
                  className="h-10 rounded-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
              </div>
            </div>
          </div>

          <div className="mt-10">


            <Label htmlFor="contact-email" className={labelClass}>
              Email address
            </Label>
            <Input
              id="contact-email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@email.com"
              maxLength={254}
              required
              className={fieldClass}
            />
          </div>

          <div className="mt-10">
            <Label htmlFor="contact-message" className={labelClass}>
              Inquiry details
            </Label>
            <Textarea
              id="contact-message"
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              placeholder="Please detail your request."
              maxLength={4000}
              rows={5}
              required
              className="min-h-28 resize-none rounded-none border-0 border-b border-border bg-transparent px-0 shadow-none focus-visible:border-ink focus-visible:ring-0"
            />
          </div>

          {error && <p className="mt-6 text-xs font-medium text-signal">{error}</p>}

          <Button
            type="submit"
            disabled={submitting}
            className="tap-target mt-12 h-11 rounded-none px-8 text-[11px] font-semibold uppercase tracking-[0.18em]"
          >
            {submitting ? "Sending..." : "Send inquiry"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
