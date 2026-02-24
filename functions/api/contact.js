/**
 * Cloudflare Pages Function — POST /api/contact
 *
 * Sends contact form emails to info@blackpearl-tours.com via Resend (free tier).
 *
 * SETUP (takes 2 minutes):
 * 1. Sign up free at https://resend.com
 * 2. Go to https://resend.com/api-keys → Create API Key
 * 3. In Cloudflare Pages dashboard:
 *    Settings → Environment Variables → Add:
 *      Variable name:  RESEND_API_KEY
 *      Value:          re_xxxxxxxxxxxx  (your key)
 * 4. Deploy — done!
 *
 * FREE TIER: 100 emails/day, 3,000/month — no credit card needed.
 *
 * NOTE: By default, emails send from "onboarding@resend.dev" (Resend's test domain).
 * To send from your own domain (e.g. noreply@blackpearlholiday.com):
 *   → Resend dashboard → Domains → Add & verify your domain
 *   → Then change FROM_EMAIL below to your domain
 */

export async function handleContact(request, env) {
  const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body = await request.json();
    const { name, phone, email, subject, message } = body;

    // --- Validation ---
    if (!name || !email) {
      return jsonResponse(400, { success: false, error: 'Name and email are required.' }, CORS_HEADERS);
    }
    if (!isValidEmail(email)) {
      return jsonResponse(400, { success: false, error: 'Please provide a valid email address.' }, CORS_HEADERS);
    }

    // --- Config ---
    const RECIPIENT = 'info@blackpearl-tours.com';
    const FROM_EMAIL = 'Black Pearl Tours <onboarding@resend.dev>'; // change after verifying your domain
    const RESEND_API_KEY = env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      return jsonResponse(500, { success: false, error: 'Email service is not configured.' }, CORS_HEADERS);
    }

    // --- Build email ---
    const emailSubject = `[Black Pearl Tours] ${subject || 'Contact Form'} — from ${name}`;

    const emailHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#faf9f6;border:1px solid #e0dcd4;border-radius:12px;overflow:hidden;">
        <div style="background:#0c0b09;padding:30px 24px;text-align:center;">
          <h1 style="color:#C4B282;margin:0;font-size:22px;">Black Pearl Tours</h1>
          <p style="color:rgba(255,255,255,0.5);margin:6px 0 0;font-size:13px;">New Contact Form Submission</p>
        </div>
        <div style="padding:28px 24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;font-weight:bold;color:#8B7D4B;width:90px;vertical-align:top;">Name</td>
              <td style="padding:10px 0;color:#333;">${esc(name)}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;font-weight:bold;color:#8B7D4B;vertical-align:top;">Email</td>
              <td style="padding:10px 0;color:#333;"><a href="mailto:${esc(email)}" style="color:#8B7D4B;">${esc(email)}</a></td>
            </tr>
            <tr>
              <td style="padding:10px 0;font-weight:bold;color:#8B7D4B;vertical-align:top;">Phone</td>
              <td style="padding:10px 0;color:#333;">${phone ? esc(phone) : '<span style="color:#999;">Not provided</span>'}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;font-weight:bold;color:#8B7D4B;vertical-align:top;">Subject</td>
              <td style="padding:10px 0;color:#333;">${subject ? esc(subject) : '<span style="color:#999;">Not specified</span>'}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:16px 0 6px;font-weight:bold;color:#8B7D4B;">Message</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:0;">
                <div style="background:#fff;border:1px solid #e0dcd4;border-radius:8px;padding:16px;color:#333;line-height:1.7;white-space:pre-wrap;">${message ? esc(message) : '<span style="color:#999;">No message</span>'}</div>
              </td>
            </tr>
          </table>
        </div>
        <div style="background:#f0ede6;padding:16px 24px;text-align:center;font-size:12px;color:#999;">
          Sent from blackpearlholiday.com contact form
        </div>
      </div>
    `;

    // --- Send via Resend ---
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [RECIPIENT],
        reply_to: email,
        subject: emailSubject,
        html: emailHtml,
      }),
    });

    if (res.ok) {
      return jsonResponse(200, { success: true, message: 'Email sent successfully.' }, CORS_HEADERS);
    }

    const errText = await res.text();
    console.error('Resend error:', res.status, errText);
    return jsonResponse(502, { success: false, error: 'Failed to send email. Please try again later.' }, CORS_HEADERS);

  } catch (err) {
    console.error('Contact function error:', err);
    return jsonResponse(500, { success: false, error: 'Internal server error.' }, CORS_HEADERS);
  }
}

/** Handle CORS preflight */
export function handleContactOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/* ---- Helpers ---- */
function jsonResponse(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

function isValidEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
