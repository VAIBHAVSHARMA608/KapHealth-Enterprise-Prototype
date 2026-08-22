const Notification = require("../models/Notification");

const EMAIL_CONFIGURED = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const SMS_CONFIGURED = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_SMS_NUMBER);

async function sendEmail({ to, subject, body }) {
  if (!EMAIL_CONFIGURED) {
    console.log(`[dev] Email not configured -- would send to ${to}: "${subject}" -- ${body}`);
    return { devMode: true };
  }
  // A real deployment would wire in nodemailer/SES/SendGrid etc. here using
  // the SMTP_* env vars. Left as a stub since no provider is bundled.
  console.log(`[email] (provider not implemented) -> ${to}: ${subject}`);
  return { devMode: false };
}

async function sendSms({ to, body }) {
  if (!SMS_CONFIGURED) {
    console.log(`[dev] SMS not configured -- would send to ${to}: ${body}`);
    return { devMode: true };
  }
  console.log(`[sms] (provider not implemented) -> ${to}: ${body}`);
  return { devMode: false };
}

/**
 * Creates an in-app notification and, if requested, fires off email/SMS too
 * (both fall back to console logging in dev, same pattern as WhatsApp OTP).
 * Never throws -- a failed notification should never break the calling
 * request (e.g. a booking should still succeed even if this fails).
 */
async function notify({ user, type = "general", title, message, relatedType = null, relatedId = null, channels = {}, email, phone }) {
  try {
    const notification = await Notification.create({
      user,
      type,
      title,
      message,
      relatedType,
      relatedId,
      channels: { inApp: true, email: !!channels.email, sms: !!channels.sms },
    });

    if (channels.email && email) await sendEmail({ to: email, subject: title, body: message });
    if (channels.sms && phone) await sendSms({ to: phone, body: `${title}: ${message}` });

    return notification;
  } catch (err) {
    console.error("notify() failed (non-fatal):", err.message);
    return null;
  }
}

module.exports = { notify };
