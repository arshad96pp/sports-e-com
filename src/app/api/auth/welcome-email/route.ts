import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { renderWelcomeEmail } from "@/lib/email/welcome-email";
import { sendMail } from "@/lib/email/smtp";

const welcomeEmailSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email(),
});

// This endpoint has no session to check (it can fire before email
// confirmation completes), so it's reachable by anyone with any email/name —
// without a limiter it's an open relay for sending a store-branded email to
// an arbitrary inbox. Same best-effort, single-instance approach as
// /api/contact: not a substitute for real abuse monitoring, but it closes
// off unlimited-volume spam from a single client.
const RESUBMIT_WINDOW_MS = 60_000;
const recentByEmail = new Map<string, number>();

const IP_WINDOW_MS = 60 * 60_000;
const IP_MAX_REQUESTS = 5;
const recentByIp = new Map<string, number[]>();

function isDuplicateEmail(email: string): boolean {
  const now = Date.now();
  for (const [k, ts] of recentByEmail) {
    if (now - ts > RESUBMIT_WINDOW_MS) recentByEmail.delete(k);
  }
  const last = recentByEmail.get(email);
  if (last && now - last < RESUBMIT_WINDOW_MS) return true;
  recentByEmail.set(email, now);
  return false;
}

function isIpRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (recentByIp.get(ip) ?? []).filter((ts) => now - ts < IP_WINDOW_MS);
  if (timestamps.length >= IP_MAX_REQUESTS) {
    recentByIp.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  recentByIp.set(ip, timestamps);
  return false;
}

/**
 * Fire-and-forget welcome email sent right after registration. Called from
 * RegisterPageClient without blocking the signup flow — a failure here must
 * never surface as a registration error, since the account already exists.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  if (isIpRateLimited(ip)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

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

  if (isDuplicateEmail(parsed.data.email)) {
    return NextResponse.json({ ok: false }, { status: 429 });
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
      subject: welcome.subject,
      html: welcome.html,
      text: welcome.text,
    });
  } catch (err) {
    console.error("Failed to send welcome email:", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
