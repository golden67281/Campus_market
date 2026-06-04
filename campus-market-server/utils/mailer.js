import nodemailer from 'nodemailer';

/**
 * Singleton persistent SMTP transporter with connection pooling.
 * Created ONCE when the server starts — reused for every email.
 * This eliminates the ~2-3s handshake delay on each OTP request.
 */
let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  _transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,           // Port 587 (STARTTLS) — works on Render free tier
    secure: false,       // false = STARTTLS (upgrades after connect), NOT port 465
    pool: true,          // Keep TCP connection alive — reuse for multiple emails
    maxConnections: 3,
    maxMessages: 50,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certs on some networks
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 15000,
  });

  // Warm up the connection immediately on first call
  _transporter.verify((err) => {
    if (err) {
      console.error('[Mailer] SMTP verify failed:', err.message);
      _transporter = null; // Reset so next call retries
    } else {
      console.log('[Mailer] ✅ SMTP pool ready on port 587 — emails will be fast!');
    }
  });

  return _transporter;
}

// Pre-warm the connection when the module is first imported
// This way the connection is ready before the first OTP request
if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
  getTransporter();
}

/**
 * Builds the OTP email HTML — extracted so it runs synchronously
 * before the async sendMail call.
 */
function buildOtpHtml(otp, userName) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Campus Market - Email Verification</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:36px 40px;text-align:center;">
              <div style="font-size:40px;margin-bottom:8px;">&#127891;</div>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">Campus Market</h1>
              <p style="margin:6px 0 0;color:#c7d2fe;font-size:13px;">Student Email Verification</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 8px;color:#374151;font-size:15px;">Hi <strong>${userName}</strong>,</p>
              <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.6;">
                Use the verification code below to confirm your college email and earn your
                <strong style="color:#4f46e5;">Verified Student</strong> badge on Campus Market.
              </p>

              <!-- OTP Box -->
              <div style="background:linear-gradient(135deg,#eef2ff,#ede9fe);border:2px solid #c7d2fe;border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
                <p style="margin:0 0 8px;color:#6366f1;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">Verification Code</p>
                <div style="font-size:44px;font-weight:900;letter-spacing:10px;color:#4338ca;font-family:'Courier New',monospace;">${otp}</div>
                <p style="margin:12px 0 0;color:#7c3aed;font-size:12px;">&#9201; Expires in <strong>10 minutes</strong></p>
              </div>

              <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:12px;padding:14px 18px;margin-bottom:24px;">
                <p style="margin:0;color:#92400e;font-size:13px;">
                  &#128274; <strong>Never share this code.</strong> Campus Market will never ask for it via call or chat.
                </p>
              </div>

              <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6;">
                If you didn't request this, simply ignore this email. Your account remains secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #f1f5f9;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">&#169; ${new Date().getFullYear()} Campus Market &middot; Built for Indian Students &#127470;&#127475;</p>
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
 * Sends a styled OTP verification email.
 * Uses the persistent pooled transporter for fast delivery.
 */
export async function sendVerificationOTP(toEmail, otp, userName = 'Student') {
  const transporter = getTransporter();

  const mailOptions = {
    from: `"Campus Market" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `${otp} — Your Campus Market Verification Code`,
    html: buildOtpHtml(otp, userName),
  };

  await transporter.sendMail(mailOptions);
}
