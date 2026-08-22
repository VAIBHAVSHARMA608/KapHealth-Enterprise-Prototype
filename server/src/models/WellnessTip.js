const mongoose = require("mongoose");

const wellnessTipSchema = new mongoose.Schema(
  {
    category: { type: String, enum: ["nutrition", "workout", "recovery", "hydration", "sleep", "mindset"], required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true, maxlength: 1000 },
    tags: [{ type: String }],
    icon: { type: String, default: "sparkles" }, // maps to a lucide icon name client-side
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WellnessTip", wellnessTipSchema);
