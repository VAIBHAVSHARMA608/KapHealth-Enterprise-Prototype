const mongoose = require("mongoose");

/**
 * A single point-in-time body measurement. BMI/BMR/TDEE are computed and
 * stored (not just derived on read) so historical entries stay accurate
 * even if the calculation formula changes later.
 */
const bodyMetricSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    forDependentId: { type: mongoose.Schema.Types.ObjectId, default: null },
    forDependentName: { type: String, default: null },

    recordedAt: { type: Date, default: Date.now },

    // Inputs
    heightCm: { type: Number, required: true },
    weightKg: { type: Number, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "very_active"],
      default: "moderate",
    },

    // Optional body measurements (cm)
    measurements: {
      waist: Number,
      hip: Number,
      chest: Number,
      neck: Number,
      arm: Number,
      thigh: Number,
    },

    bodyFatPercent: { type: Number }, // entered directly, or Navy-method estimate
    muscleMassKg: { type: Number },

    // Computed (snapshot at save time)
    bmi: { type: Number },
    bmiCategory: { type: String },
    bmr: { type: Number }, // Mifflin-St Jeor, kcal/day
    tdee: { type: Number }, // BMR * activity multiplier, kcal/day

    notes: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

bodyMetricSchema.index({ patient: 1, recordedAt: -1 });

module.exports = mongoose.model("BodyMetric", bodyMetricSchema);
