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
 * Renders the "welcome" email sent right after a customer registers.
 * Kept to table-based layout and inline styles, matching contact-email.ts,
 * since that's what renders consistently across email clients.
 */
export function renderWelcomeEmail({ fullName }: { fullName: string }) {
  const safeName = escapeHtml(fullName);
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
                  Welcome to ${safeStoreName}! Your account has been created successfully.
                </p>
                <p style="margin:0 0 20px 0;font-size:15px;line-height:1.7;color:#1a1a1a;">
                  You can now sign in to save your favourites, manage your addresses, and track your orders.
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

  const text = `Hi ${fullName},

Welcome to ${STORE.name}! Your account has been created successfully.

You can now sign in to save your favourites, manage your addresses, and track your orders.

Regards,
${STORE.name}`;

  return { html, text };
}
