const mongoose = require("mongoose");

/**
 * Doctor onboarding profile. Vitals/qualification fields are captured here
 * and reviewed by the admin (isApproved) before the doctor becomes bookable.
 */
const doctorProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    // ---- Identity / vitals (as requested: "vital information") ----
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    bloodGroup: { type: String, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"] },
    heightCm: { type: Number },
    weightKg: { type: Number },

    // ---- Professional details ----
    registrationCouncil: { type: String, required: true }, // e.g. "Medical Council of India"
    registrationNumber: { type: String, required: true },
    registrationYear: { type: Number, required: true },
    qualifications: [{ type: String }], // ["MBBS", "MD - General Medicine"]
    specializations: [{ type: String, required: true }], // ["Cardiology", "General Physician"]
    yearsOfExperience: { type: Number, required: true, min: 0 },
    languagesSpoken: [{ type: String }],
    clinicOrHospital: { type: String },
    consultationFee: { type: Number, required: true, min: 0 },

    bio: { type: String, maxlength: 1000 },

    // ---- Verification documents (stored as uploaded file URLs) ----
    documents: {
      governmentId: { type: String },
      medicalRegistrationCertificate: { type: String },
      degreeCertificate: { type: String },
      profilePhoto: { type: String },
    },

    availability: [
      {
        dayOfWeek: { type: Number, min: 0, max: 6 }, // 0=Sunday
        startTime: { type: String }, // "09:00"
        endTime: { type: String }, // "17:00"
        slotDurationMinutes: { type: Number, default: 15 },
      },
    ],

    onboardingStatus: {
      type: String,
      enum: ["pending_review", "approved", "rejected", "changes_requested"],
      default: "pending_review",
    },
    adminReviewNote: { type: String },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },

    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DoctorProfile", doctorProfileSchema);
