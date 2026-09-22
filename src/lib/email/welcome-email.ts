import { SITE_URL, STORE } from "@/lib/config";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

/**
 * Renders the "welcome" email sent right after a customer registers.
 * Table layout + inline styles so it matches the storefront (black / white
 * theme, pill CTA) and still renders in common email clients.
 */
export function renderWelcomeEmail({ fullName }: { fullName: string }) {
  const safeName = escapeHtml(firstName(fullName));
  const safeStoreName = escapeHtml(STORE.name);
  const safeTagline = escapeHtml(STORE.tagline);
  const safeSupport = escapeHtml(STORE.supportEmail);
  const origin = SITE_URL.replace(/\/$/, "");
  const shopUrl = escapeHtml(origin);
  const accountUrl = escapeHtml(`${origin}/account`);
  const font = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Welcome to ${safeStoreName}</title>
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
  <body style="margin:0;padding:0;background-color:#F6F6F4;font-family:${font};">
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
                <p style="margin:0 0 12px;color:#0A0A0A;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">
                  <span style="color:#6F6F6B;">Account ready</span>
                </p>
                <h1 class="hero-title" style="margin:0 0 14px;color:#0A0A0A;font-size:30px;font-weight:800;letter-spacing:-0.03em;line-height:1.15;">
                  Hey, ${safeName}.
                </h1>
                <p style="margin:0;color:#6F6F6B;font-size:15px;line-height:1.7;">
                  Good to have you. Your ${safeStoreName} account is live &mdash; football, cricket, tennis and everyday training kit, ready when you are.
                </p>
                <p style="margin:14px 0 0;color:#6F6F6B;font-size:15px;line-height:1.7;">
                  Save what you like. Check out faster next time. That&rsquo;s it.
                </p>
              </td>
            </tr>

            <tr>
              <td class="px" style="padding:28px 36px 8px;">
                <a
                  class="cta"
                  href="${shopUrl}"
                  style="display:inline-block;background-color:#0A0A0A;color:#FFFFFF;font-size:14px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:999px;"
                >
                  Shop the collection
                </a>
                <p style="margin:16px 0 0;">
                  <a href="${accountUrl}" style="color:#0A0A0A;font-size:13px;font-weight:600;text-decoration:none;">Go to your account &rarr;</a>
                </p>
              </td>
            </tr>

            <tr>
              <td class="px" style="padding:36px 36px 8px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E3E3DF;">
                  <tr>
                    <td style="padding:20px 0;border-bottom:1px solid #E3E3DF;">
                      <p style="margin:0 0 4px;color:#0A0A0A;font-size:14px;font-weight:700;">Quality gear</p>
                      <p style="margin:0;color:#6F6F6B;font-size:14px;line-height:1.55;">Football, cricket and tennis kit tested for the game.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 0;border-bottom:1px solid #E3E3DF;">
                      <p style="margin:0 0 4px;color:#0A0A0A;font-size:14px;font-weight:700;">Fast delivery</p>
                      <p style="margin:0;color:#6F6F6B;font-size:14px;line-height:1.55;">Shipped across India, to your doorstep.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 0 4px;">
                      <p style="margin:0 0 4px;color:#0A0A0A;font-size:14px;font-weight:700;">Easy returns</p>
                      <p style="margin:0;color:#6F6F6B;font-size:14px;line-height:1.55;">Simple returns if it isn&rsquo;t right.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td bgcolor="#0A0A0A" class="px" style="background-color:#0A0A0A;padding:24px 36px;">
                <p style="margin:0 0 6px;color:rgba(255,255,255,0.55);font-size:12px;line-height:1.5;">Need a hand?</p>
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

  const text = `Hey, ${firstName(fullName)}.

Good to have you. Your ${STORE.name} account is live — football, cricket, tennis and everyday training kit, ready when you are.

Save what you like. Check out faster next time. That's it.

Shop the collection
${origin}

Go to your account
${origin}/account

Quality gear
Football, cricket and tennis kit tested for the game.

Fast delivery
Shipped across India, to your doorstep.

Easy returns
Simple returns if it isn't right.

Need a hand?
${STORE.supportEmail}

${STORE.name} · ${STORE.tagline}`;

  return { html, text, subject: `Welcome to ${STORE.name}, ${firstName(fullName)}!` };
}
