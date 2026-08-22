const mongoose = require("mongoose");

const patientProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    bloodGroup: { type: String },
    heightCm: { type: Number },
    weightKg: { type: Number },
    allergies: [{ type: String }],
    chronicConditions: [{ type: String }],
    currentMedications: [{ type: String }],

    addresses: [
      {
        label: { type: String, default: "Home" },
        line1: String,
        line2: String,
        city: String,
        state: String,
        pincode: String,
        isDefault: { type: Boolean, default: false },
      },
    ],

    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },

    // Phase 3: family members this patient manages care for. Appointments and
    // lab bookings can be made "for" one of these instead of the account holder.
    dependents: [
      {
        name: { type: String, required: true },
        relation: { type: String, enum: ["spouse", "child", "parent", "sibling", "other"], required: true },
        dateOfBirth: { type: Date },
        gender: { type: String, enum: ["male", "female", "other"] },
        bloodGroup: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("PatientProfile", patientProfileSchema);
