const axios = require("axios");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

/**
 * WhatsApp OTP delivery via Meta's WhatsApp Cloud API.
 * Requires: a Meta Business + WhatsApp Cloud API app, a verified phone
 * number, and an approved message template (see WHATSAPP_OTP_TEMPLATE_NAME).
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 *
 * This module is a thin, swappable wrapper -- to switch providers (Twilio,
 * Gupshup, etc.) only this file needs to change.
 */

function generateOtpCode() {
  // 6-digit numeric code
  return crypto.randomInt(100000, 999999).toString();
}

async function hashOtp(code) {
  return bcrypt.hash(code, 10);
}

async function verifyOtpHash(code, hash) {
  return bcrypt.compare(code, hash);
}

async function sendWhatsAppOtp(phone, code) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v20.0";
  const templateName = process.env.WHATSAPP_OTP_TEMPLATE_NAME || "kaphealth_otp";

  if (!phoneNumberId || !token) {
    // No credentials configured yet -- log instead of throwing, so local
    // development/demo works without a live WhatsApp Business account.
    console.warn(
      `[whatsapp:STUB] Would send OTP ${code} to ${phone} via template "${templateName}". ` +
        `Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN in .env to go live.`
    );
    return { stubbed: true };
  }

  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
  const payload = {
    messaging_product: "whatsapp",
    to: phone.replace("+", ""),
    type: "template",
    template: {
      name: templateName,
      language: { code: "en_US" },
      components: [
        { type: "body", parameters: [{ type: "text", text: code }] },
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [{ type: "text", text: code }],
        },
      ],
    },
  };

  const { data } = await axios.post(url, payload, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  return data;
}

module.exports = { generateOtpCode, hashOtp, verifyOtpHash, sendWhatsAppOtp };
