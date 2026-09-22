import { STORE } from "@/lib/config";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || "";
}

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

/**
 * Renders the password-reset email. Table layout + inline styles so it matches
 * the other Enzo Sports mailers (black / white, pill CTA) in common clients.
 * `resetUrl` is the only place the recovery token appears.
 */
export function renderResetPasswordEmail({ fullName, resetUrl }: { fullName: string; resetUrl: string }) {
  const name = firstName(fullName);
  const safeName = escapeHtml(name);
  const safeStoreName = escapeHtml(STORE.name);
  const safeTagline = escapeHtml(STORE.tagline);
  const safeSupport = escapeHtml(STORE.supportEmail);
  const safeResetUrl = escapeHtml(resetUrl);
  const greeting = name ? `Hi ${name},` : "Hi,";
  const safeGreeting = name ? `Hi ${safeName},` : "Hi,";

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Reset your ${safeStoreName} password</title>
    <style type="text/css">
      body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      table { border-collapse: collapse !important; }
      @media only screen and (max-width: 620px) {
        .email-outer { padding: 16px !important; }
        .email-card { width: 100% !important; }
        .px { padding-left: 24px !important; padding-right: 24px !important; }
        .hero-title { font-size: 26px !important; }
        .cta { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background-color:#F6F6F4;font-family:${FONT};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#F6F6F4" style="background-color:#F6F6F4;">
      <tr>
        <td class="email-outer" align="center" style="padding:32px 16px;">
          <table class="email-card" role="presentation" width="560" cellpadding="0" cellspacing="0" bgcolor="#FFFFFF" style="width:100%;max-width:560px;background-color:#FFFFFF;border-radius:12px;overflow:hidden;">
            <tr>
              <td class="px" style="padding:22px 36px;border-bottom:1px solid #E3E3DF;">
                <span style="color:#0A0A0A;font-size:16px;font-weight:800;letter-spacing:-0.02em;">${safeStoreName}</span>
              </td>
            </tr>
            <tr>
              <td class="px" style="padding:40px 36px 8px;">
                <p style="margin:0 0 12px;color:#6F6F6B;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">
                  Password reset
                </p>
                <h1 class="hero-title" style="margin:0 0 14px;color:#0A0A0A;font-size:30px;font-weight:800;letter-spacing:-0.03em;line-height:1.15;">
                  ${safeGreeting}
                </h1>
                <p style="margin:0;color:#6F6F6B;font-size:15px;line-height:1.7;">
                  We received a request to reset your ${safeStoreName} password.
                </p>
                <p style="margin:14px 0 0;color:#6F6F6B;font-size:15px;line-height:1.7;">
                  Click below to choose a new password:
                </p>
              </td>
            </tr>
            <tr>
              <td class="px" style="padding:28px 36px 8px;">
                <a
                  class="cta"
                  href="${safeResetUrl}"
                  style="display:inline-block;background-color:#0A0A0A;color:#FFFFFF;font-size:14px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:999px;letter-spacing:0.04em;"
                >
                  RESET PASSWORD
                </a>
                <p style="margin:20px 0 0;color:#6F6F6B;font-size:14px;line-height:1.7;">
                  This link expires in 30 minutes.
                </p>
                <p style="margin:14px 0 0;color:#6F6F6B;font-size:14px;line-height:1.7;">
                  If you didn&rsquo;t request this, you can safely ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td bgcolor="#0A0A0A" class="px" style="background-color:#0A0A0A;padding:24px 36px;">
                <p style="margin:0 0 6px;color:rgba(255,255,255,0.55);font-size:12px;line-height:1.5;">Questions?</p>
                <p style="margin:0 0 16px;">
                  <a href="mailto:${safeSupport}" style="color:#FFFFFF;font-size:12px;font-weight:600;text-decoration:none;">${safeSupport}</a>
                </p>
                <p style="margin:0;color:rgba(255,255,255,0.45);font-size:12px;line-height:1.5;">${safeStoreName} &middot; ${safeTagline}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `${greeting}

We received a request to reset your ${STORE.name} password.

Click below to choose a new password:
${resetUrl}

This link expires in 30 minutes.

If you didn't request this, you can safely ignore this email.

Questions?
${STORE.supportEmail}

${STORE.name} · ${STORE.tagline}`;

  return { html, text, subject: `Reset your ${STORE.name} password` };
}
