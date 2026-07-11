const { z } = require("zod");

const phoneSchema = z.string().regex(/^\+[1-9]\d{7,14}$/, "Phone must be in E.164 format, e.g. +919876543210");

const requestOtpSchema = z.object({
  phone: phoneSchema,
  purpose: z.enum(["login", "signup"]).default("login"),
  name: z.string().min(2).max(80).optional(), // required client-side for signup
  role: z.enum(["patient", "doctor"]).default("patient"),
});

const verifyOtpSchema = z.object({
  phone: phoneSchema,
  code: z.string().length(6),
  name: z.string().min(2).max(80).optional(),
  role: z.enum(["patient", "doctor"]).default("patient"),
});

const googleAuthSchema = z.object({
  idToken: z.string().min(20),
  role: z.enum(["patient", "doctor"]).default("patient"),
});

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

module.exports = { requestOtpSchema, verifyOtpSchema, googleAuthSchema, adminLoginSchema };
