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

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

function emailDocument(title: string, inner: string) {
  const safeStoreName = escapeHtml(STORE.name);
  const safeTagline = escapeHtml(STORE.tagline);
  const safeSupport = escapeHtml(STORE.supportEmail);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>${escapeHtml(title)}</title>
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
            ${inner}
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
}

/**
 * Renders the "thank you for contacting us" confirmation email sent to the
 * customer who submitted the contact form. Kept to table-based layout and
 * inline styles since that's what renders consistently across email clients.
 */
export function renderContactConfirmationEmail({ name }: { name: string }) {
  const safeName = escapeHtml(firstName(name));
  const shopUrl = escapeHtml(SITE_URL.replace(/\/$/, ""));

  const inner = `
            <tr>
              <td class="px" style="padding:40px 36px 8px;">
                <p style="margin:0 0 12px;color:#6F6F6B;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">
                  Message received
                </p>
                <h1 class="hero-title" style="margin:0 0 14px;color:#0A0A0A;font-size:30px;font-weight:800;letter-spacing:-0.03em;line-height:1.15;">
                  Hey, ${safeName}.
                </h1>
                <p style="margin:0;color:#6F6F6B;font-size:15px;line-height:1.7;">
                  Thanks for writing in. We&rsquo;ve got your message and will get back to you shortly.
                </p>
              </td>
            </tr>
            <tr>
              <td class="px" style="padding:28px 36px 40px;">
                <a
                  class="cta"
                  href="${shopUrl}"
                  style="display:inline-block;background-color:#0A0A0A;color:#FFFFFF;font-size:14px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:999px;"
                >
                  Shop the collection
                </a>
              </td>
            </tr>`;

  const html = emailDocument("Thanks for getting in touch", inner);

  const text = `Hey, ${firstName(name)}.

Thanks for writing in. We've got your message and will get back to you shortly.

Shop the collection
${SITE_URL.replace(/\/$/, "")}

Need a hand?
${STORE.supportEmail}

${STORE.name} · ${STORE.tagline}`;

  return { html, text };
}

/**
 * Renders the internal notification sent to CONTACT_EMAIL whenever a
 * customer submits the contact form. Reply-To is set to the customer's
 * address separately when sending, so the store can just hit reply.
 */
export function renderContactNotificationEmail({
  name,
  email,
  phone,
  message,
}: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  const inner = `
            <tr>
              <td class="px" style="padding:40px 36px 8px;">
                <p style="margin:0 0 12px;color:#6F6F6B;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">
                  New inquiry
                </p>
                <h1 class="hero-title" style="margin:0 0 14px;color:#0A0A0A;font-size:30px;font-weight:800;letter-spacing:-0.03em;line-height:1.15;">
                  New message
                </h1>
                <p style="margin:0;color:#6F6F6B;font-size:15px;line-height:1.7;">
                  Someone wrote in from the contact form. Reply to this email to reach them.
                </p>
              </td>
            </tr>
            <tr>
              <td class="px" style="padding:28px 36px 40px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E3E3DF;">
                  <tr>
                    <td style="padding:20px 0;border-bottom:1px solid #E3E3DF;">
                      <p style="margin:0 0 4px;color:#0A0A0A;font-size:14px;font-weight:700;">Name</p>
                      <p style="margin:0;color:#6F6F6B;font-size:14px;line-height:1.55;">${safeName}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 0;border-bottom:1px solid #E3E3DF;">
                      <p style="margin:0 0 4px;color:#0A0A0A;font-size:14px;font-weight:700;">Email</p>
                      <p style="margin:0;font-size:14px;line-height:1.55;">
                        <a href="mailto:${safeEmail}" style="color:#0A0A0A;text-decoration:none;">${safeEmail}</a>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 0;border-bottom:1px solid #E3E3DF;">
                      <p style="margin:0 0 4px;color:#0A0A0A;font-size:14px;font-weight:700;">Phone</p>
                      <p style="margin:0;font-size:14px;line-height:1.55;">
                        <a href="tel:${safePhone.replace(/\s/g, "")}" style="color:#0A0A0A;text-decoration:none;">${safePhone}</a>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 0 4px;">
                      <p style="margin:0 0 4px;color:#0A0A0A;font-size:14px;font-weight:700;">Message</p>
                      <p style="margin:0;color:#6F6F6B;font-size:14px;line-height:1.7;">${safeMessage}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`;

  const html = emailDocument("New Contact Us Inquiry", inner);

  const text = `New inquiry

Name: ${name}
Email: ${email}
Phone: ${phone}

Message:
${message}

${STORE.name} · ${STORE.tagline}`;

  return { html, text };
}
