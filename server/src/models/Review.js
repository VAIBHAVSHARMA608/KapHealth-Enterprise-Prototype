const mongoose = require("mongoose");

/**
 * A single review can target a doctor (post-consult) OR an order (post-delivery).
 * exactly one of `doctor` / `order` is set, enforced in the controller.
 */
const reviewSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["doctor", "order"], required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },

    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 1000 },

    isHidden: { type: Boolean, default: false }, // admin moderation
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
