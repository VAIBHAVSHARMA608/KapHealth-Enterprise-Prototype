const mongoose = require("mongoose");

const aiReviewRequestSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["physique", "diet"], required: true },
    imageUrls: [{ type: String, required: true }],
    notes: { type: String, maxlength: 500 }, // patient's own note, e.g. "goal: lean bulk"

    // Real AI model integration lands later -- this is what makes the
    // button "work" today: a real upload + a clearly-labeled placeholder
    // result, not a dead button. See utils/aiReviewStub.js.
    status: { type: String, enum: ["completed"], default: "completed" },
    isPlaceholder: { type: Boolean, default: true },
    result: {
      summary: String,
      observations: [String],
      suggestions: [String],
      disclaimer: String,
    },
  },
  { timestamps: true }
);

aiReviewRequestSchema.index({ patient: 1, createdAt: -1 });

module.exports = mongoose.model("AiReviewRequest", aiReviewRequestSchema);
