import nodemailer, { type Transporter } from "nodemailer";

interface SendMailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !port || !user || !password) {
    throw new Error("SMTP is not configured: SMTP_HOST, SMTP_PORT, SMTP_USER, or SMTP_PASSWORD is not set.");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: false, // STARTTLS is negotiated on port 587, not implicit TLS.
    requireTLS: true,
    // Google displays App Passwords with spaces for readability; SMTP auth
    // needs the raw 16 characters or Gmail rejects the login.
    auth: { user, pass: password.replace(/\s+/g, "") },
  });

  return transporter;
}

/**
 * Sends one email via Gmail SMTP (STARTTLS on port 587). Throws on missing
 * config or a send failure — callers decide how to handle failure.
 */
export async function sendMail({ to, subject, html, text, replyTo }: SendMailParams) {
  const from = process.env.SMTP_USER;
  await getTransporter().sendMail({
    from,
    to,
    subject,
    html,
    text,
    ...(replyTo ? { replyTo } : {}),
  });
}
