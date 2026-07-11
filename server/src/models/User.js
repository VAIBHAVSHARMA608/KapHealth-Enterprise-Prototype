const mongoose = require("mongoose");

/**
 * A User is the base identity record shared by patients, doctors and admins.
 * Role-specific data lives in Patient / Doctor profile documents that
 * reference this User by _id, keeping auth concerns separate from
 * domain/profile concerns.
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true }, // E.164 format e.g. +919876543210
    passwordHash: { type: String, select: false }, // only set for admin/email-password accounts
    avatarUrl: { type: String, default: "" },

    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      required: true,
      default: "patient",
    },

    authProviders: {
      whatsapp: { type: Boolean, default: false },
      google: { type: Boolean, default: false },
      password: { type: Boolean, default: false },
    },
    googleId: { type: String, index: true, sparse: true },

    isPhoneVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["active", "suspended", "deleted"],
      default: "active",
    },

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, status: 1 });

module.exports = mongoose.model("User", userSchema);
