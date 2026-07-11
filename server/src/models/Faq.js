const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    audience: { type: String, enum: ["patient", "doctor", "both"], default: "both", index: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, default: "general" },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Faq", faqSchema);
