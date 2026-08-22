const mongoose = require("mongoose");

const LAB_TEST_CATEGORIES = [
  "Full Body Checkup",
  "Diabetes",
  "Thyroid",
  "Liver",
  "Kidney",
  "Cardiac",
  "Vitamin & Mineral",
  "Hormone",
  "COVID-19",
  "Cancer Screening",
  "Women's Health",
  "Men's Health",
  "General Blood Work",
];

const labTestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    category: { type: String, enum: LAB_TEST_CATEGORIES, required: true, index: true },
    description: { type: String, maxlength: 1000 },
    sampleType: { type: String, enum: ["Blood", "Urine", "Swab", "Saliva", "Stool", "None"], default: "Blood" },
    fastingRequired: { type: Boolean, default: false },
    reportTimeHours: { type: Number, default: 24 },
    mrp: { type: Number, required: true },
    price: { type: Number, required: true },
    homeCollectionAvailable: { type: Boolean, default: true },
    parametersCovered: { type: Number }, // e.g. "72 parameters" for full body checkups
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

labTestSchema.index({ name: "text", category: "text" });

module.exports = mongoose.model("LabTest", labTestSchema);
module.exports.LAB_TEST_CATEGORIES = LAB_TEST_CATEGORIES;
