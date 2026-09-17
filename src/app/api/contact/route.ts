import { NextResponse, type NextRequest } from "next/server";
import { contactFormSchema } from "@/lib/validations/contact";
import { renderContactConfirmationEmail, renderContactNotificationEmail } from "@/lib/email/contact-email";
import { sendMail } from "@/lib/email/smtp";

const GENERIC_ERROR = "Something went wrong while sending your message. Please try again.";
const DUPLICATE_ERROR = "You've already submitted this recently. We'll be in touch shortly.";

// Best-effort de-dupe within a single server instance — not shared across
// serverless invocations, but stops accidental double-clicks/double-fetches.
const RESUBMIT_WINDOW_MS = 60_000;
const recentSubmissions = new Map<string, number>();

function isDuplicate(key: string): boolean {
  const now = Date.now();
  for (const [k, ts] of recentSubmissions) {
    if (now - ts > RESUBMIT_WINDOW_MS) recentSubmissions.delete(k);
  }
  const last = recentSubmissions.get(key);
  if (last && now - last < RESUBMIT_WINDOW_MS) return true;
  recentSubmissions.set(key, now);
  return false;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid submission." },
      { status: 400 }
    );
  }

  // Honeypot: bots fill every field, real users never see this one. Report
  // success without sending anything so the bot doesn't learn to skip it.
  if (parsed.data.hp_topic) {
    return NextResponse.json({ ok: true });
  }

  const { name, email, phone, message } = parsed.data;

  if (isDuplicate(email)) {
    return NextResponse.json({ ok: false, error: DUPLICATE_ERROR }, { status: 429 });
  }

  const contactEmail = process.env.CONTACT_EMAIL;
  if (!contactEmail || !process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.error(
      "Contact form is misconfigured: CONTACT_EMAIL, SMTP_HOST, SMTP_PORT, SMTP_USER, or SMTP_PASSWORD is not set."
    );
    return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 500 });
  }

  const notification = renderContactNotificationEmail({ name, email, phone, message });

  try {
    await sendMail({
      to: contactEmail,
      replyTo: email,
      subject: `New inquiry from ${name}`,
      html: notification.html,
      text: notification.text,
    });
  } catch (err) {
    console.error("Failed to send contact notification email:", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: GENERIC_ERROR }, { status: 502 });
  }

  // Best-effort confirmation to the customer — the inquiry has already
  // reached the store at this point, so a failure here shouldn't surface as
  // an error to the user.
  try {
    const confirmation = renderContactConfirmationEmail({ name });
    await sendMail({
      to: email,
      subject: "Thank you for contacting us",
      html: confirmation.html,
      text: confirmation.text,
    });
  } catch (err) {
    console.error("Failed to send contact confirmation email:", err instanceof Error ? err.message : err);
  }

  return NextResponse.json({ ok: true });
}
