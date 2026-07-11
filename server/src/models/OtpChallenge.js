const mongoose = require("mongoose");

/**
 * Short-lived OTP challenge for WhatsApp login. We store a hash of the
 * code (never the raw code) and expire documents automatically via TTL index.
 */
const otpChallengeSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    purpose: { type: String, enum: ["login", "signup"], default: "login" },
    attempts: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

otpChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("OtpChallenge", otpChallengeSchema);
