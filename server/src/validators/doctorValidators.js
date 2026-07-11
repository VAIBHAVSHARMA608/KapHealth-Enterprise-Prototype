const { z } = require("zod");

const doctorOnboardingSchema = z.object({
  dateOfBirth: z.string(), // ISO date string from date input
  gender: z.enum(["male", "female", "other"]),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"]).optional(),
  heightCm: z.number().min(50).max(272).optional(),
  weightKg: z.number().min(2).max(400).optional(),

  registrationCouncil: z.string().min(2),
  registrationNumber: z.string().min(2),
  registrationYear: z.number().min(1950).max(new Date().getFullYear()),
  qualifications: z.array(z.string()).min(1),
  specializations: z.array(z.string()).min(1),
  yearsOfExperience: z.number().min(0).max(70),
  languagesSpoken: z.array(z.string()).optional(),
  clinicOrHospital: z.string().optional(),
  consultationFee: z.number().min(0),
  bio: z.string().max(1000).optional(),

  availability: z
    .array(
      z.object({
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string(),
        endTime: z.string(),
        slotDurationMinutes: z.number().min(5).max(120).default(15),
      })
    )
    .optional(),
});

module.exports = { doctorOnboardingSchema };
