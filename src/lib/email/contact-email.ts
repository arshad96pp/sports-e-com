import { STORE } from "@/lib/config";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Renders the "thank you for contacting us" confirmation email sent to the
 * customer who submitted the contact form. Kept to table-based layout and
 * inline styles since that's what renders consistently across email clients.
 */
export function renderContactConfirmationEmail({ name }: { name: string }) {
  const safeName = escapeHtml(name);
  const safeStoreName = escapeHtml(STORE.name);
  const safeTagline = escapeHtml(STORE.tagline);

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeStoreName}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;">
            <tr>
              <td style="padding:40px 40px 24px 40px;text-align:center;border-bottom:1px solid #e5e5e5;">
                <div style="font-size:20px;letter-spacing:4px;font-weight:700;color:#0a0a0a;text-transform:uppercase;">
                  ${safeStoreName}
                </div>
                <div style="margin-top:6px;font-size:11px;letter-spacing:3px;color:#b8964f;text-transform:uppercase;">
                  ${safeTagline}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:40px;">
                <p style="margin:0 0 20px 0;font-size:15px;line-height:1.7;color:#1a1a1a;">
                  Hi ${safeName},
                </p>
                <p style="margin:0 0 20px 0;font-size:15px;line-height:1.7;color:#1a1a1a;">
                  Thank you for contacting us.
                </p>
                <p style="margin:0 0 20px 0;font-size:15px;line-height:1.7;color:#1a1a1a;">
                  We have received your request successfully. Our team will review your message and get back to you by email shortly.
                </p>
                <p style="margin:28px 0 0 0;font-size:15px;line-height:1.7;color:#1a1a1a;">
                  Regards,<br />
                  ${safeStoreName}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px;text-align:center;background-color:#fafafa;">
                <div style="font-size:10px;letter-spacing:2px;color:#999999;text-transform:uppercase;">
                  ${safeStoreName}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `Hi ${name},

Thank you for contacting us.

We have received your request successfully. Our team will review your message and get back to you by email shortly.

Regards,
${STORE.name}`;

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

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>New Contact Us Inquiry</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;">
            <tr>
              <td style="padding:32px 40px;text-align:center;border-bottom:1px solid #e5e5e5;">
                <div style="font-size:18px;letter-spacing:4px;font-weight:700;color:#0a0a0a;text-transform:uppercase;">
                  New Contact Us Inquiry
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:0 0 16px 0;">
                      <div style="font-size:10px;letter-spacing:2px;color:#b8964f;text-transform:uppercase;">Name</div>
                      <div style="font-size:15px;color:#1a1a1a;margin-top:4px;">${safeName}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 16px 0;">
                      <div style="font-size:10px;letter-spacing:2px;color:#b8964f;text-transform:uppercase;">Email</div>
                      <div style="font-size:15px;color:#1a1a1a;margin-top:4px;">${safeEmail}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 16px 0;">
                      <div style="font-size:10px;letter-spacing:2px;color:#b8964f;text-transform:uppercase;">Phone</div>
                      <div style="font-size:15px;color:#1a1a1a;margin-top:4px;">${safePhone}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 0 0 0;border-top:1px solid #e5e5e5;">
                      <div style="font-size:10px;letter-spacing:2px;color:#b8964f;text-transform:uppercase;">Message</div>
                      <div style="font-size:14px;line-height:1.7;color:#333333;margin-top:8px;">${safeMessage}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `New Contact Us Inquiry

Name: ${name}
Email: ${email}
Phone: ${phone}

Message:
${message}`;

  return { html, text };
}
