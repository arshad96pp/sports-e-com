"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/lib/context/ToastContext";

const GENERIC_ERROR = "Something went wrong while sending your message. Please try again.";

interface FormState {
  name: string;
  email: string;
  phone: string;
  message: string;
  hp_topic: string; // honeypot — left blank by real users
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
    if (!form.phone.trim()) return "Enter your phone number";
    if (!/^[0-9+\-\s()]{7,20}$/.test(form.phone.trim())) return "Enter a valid phone number";
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
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3 rounded-xl border border-border p-4">
      {/* Honeypot — hidden from real users, autofilled by bots. Name/label/id
          deliberately avoid any recognized browser-autofill field (e.g.
          "company"/"organization"), which Chrome will silently fill from a
          saved address profile even with autocomplete=off. */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="contact-hp-topic">Leave this field blank</label>
        <input
          id="contact-hp-topic"
          name="contact-hp-topic"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.hp_topic}
          onChange={(e) => update("hp_topic", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="contact-name" className="mb-1.5 text-xs font-semibold text-ink-soft">
          Full Name
        </Label>
        <Input
          id="contact-name"
          type="text"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Your name"
          maxLength={120}
          required
        />
      </div>

      <div>
        <Label htmlFor="contact-email" className="mb-1.5 text-xs font-semibold text-ink-soft">
          Email Address
        </Label>
        <Input
          id="contact-email"
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="you@example.com"
          maxLength={254}
          required
        />
      </div>

      <div>
        <Label htmlFor="contact-phone" className="mb-1.5 text-xs font-semibold text-ink-soft">
          Phone Number
        </Label>
        <Input
          id="contact-phone"
          type="tel"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="+91 98765 43210"
          maxLength={20}
          required
        />
      </div>

      <div>
        <Label htmlFor="contact-message" className="mb-1.5 text-xs font-semibold text-ink-soft">
          Message
        </Label>
        <Textarea
          id="contact-message"
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="Tell us more about your question..."
          maxLength={4000}
          rows={4}
          required
        />
      </div>

      {error && <p className="text-xs font-medium text-signal">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="tap-target self-start rounded-full bg-ink px-6 text-sm font-bold text-white disabled:opacity-60"
      >
        {submitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
