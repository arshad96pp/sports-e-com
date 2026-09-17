import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { renderWelcomeEmail } from "@/lib/email/welcome-email";
import { sendMail } from "@/lib/email/smtp";

const welcomeEmailSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email(),
});

/**
 * Fire-and-forget welcome email sent right after registration. Called from
 * RegisterPageClient without blocking the signup flow — a failure here must
 * never surface as a registration error, since the account already exists.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = welcomeEmailSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.error("Welcome email skipped: SMTP is not configured.");
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const { fullName, email } = parsed.data;
  const welcome = renderWelcomeEmail({ fullName });

  try {
    await sendMail({
      to: email,
      subject: `Welcome to our store, ${fullName.split(" ")[0]}!`,
      html: welcome.html,
      text: welcome.text,
    });
  } catch (err) {
    console.error("Failed to send welcome email:", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
