const { z } = require("zod");

const phoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, "Phone must be in E.164 format, e.g. +919876543210");

const optionalName = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .optional()
  .or(z.literal(""));

const requestOtpSchema = z.object({
  phone: phoneSchema,
  purpose: z.enum(["login", "signup"]).default("login"),
  name: optionalName,
  role: z.enum(["patient", "doctor"]).default("patient"),
});

const verifyOtpSchema = z.object({
  phone: phoneSchema,
  code: z.string().length(6),
  name: optionalName,
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

const testLoginSchema = z.object({
  identifier: z.string().trim().min(3), // email OR phone (E.164) of a seeded test account
  password: z.string().min(4),
});

module.exports = {
  requestOtpSchema,
  verifyOtpSchema,
  googleAuthSchema,
  adminLoginSchema,
  testLoginSchema,
};