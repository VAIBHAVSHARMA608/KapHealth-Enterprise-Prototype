const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

function generateOtpCode() {
  return crypto.randomInt(100000, 999999).toString();
}

async function hashOtp(code) {
  return bcrypt.hash(code, 10);
}

async function verifyOtpHash(code, hash) {
  return bcrypt.compare(code, hash);
}

const TWILIO_CONFIGURED = Boolean(
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_NUMBER
);

async function sendWhatsAppOtp(phone, code) {
  if (!TWILIO_CONFIGURED) {
    // Dev fallback: no Twilio account configured, so print the OTP instead
    // of sending it. Lets the whole login flow be tested locally for free.
    console.log(`[dev] WhatsApp not configured -- OTP for ${phone} is: ${code}`);
    return { sid: "dev-stub", devMode: true };
  }

  try {
    const message = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${phone}`,
      body: `🔐 Your KapHealth OTP is ${code}. It is valid for 5 minutes.`,
    });

    console.log("WhatsApp OTP sent:", message.sid);
    return message;
  } catch (err) {
    console.error("Twilio Error:", err.message);
    throw err;
  }
}

module.exports = {
  generateOtpCode,
  hashOtp,
  verifyOtpHash,
  sendWhatsAppOtp,
};