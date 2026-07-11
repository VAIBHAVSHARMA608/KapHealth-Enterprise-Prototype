const { z } = require("zod");

const bookAppointmentSchema = z.object({
  doctorId: z.string().length(24),
  scheduledStart: z.string(), // ISO datetime
  reasonForVisit: z.string().max(500).optional(),
  paymentMethod: z.enum(["razorpay"]).default("razorpay"), // consult fee is always online in this design
});

const prescriptionSchema = z.object({
  diagnosis: z.string().max(1000).optional(),
  notesForPatient: z.string().max(1000).optional(),
  followUpDate: z.string().optional(),
  medicines: z
    .array(
      z.object({
        name: z.string().min(1),
        dosage: z.string().min(1),
        frequency: z.string().min(1),
        durationDays: z.number().min(1),
        instructions: z.string().optional(),
      })
    )
    .min(1),
});

module.exports = { bookAppointmentSchema, prescriptionSchema };
