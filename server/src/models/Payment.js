const mongoose = require("mongoose");

/**
 * Generic payment record used by BOTH appointment fees and medicine orders,
 * so the admin panel has one place to reconcile all money movement.
 */
const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    purpose: { type: String, enum: ["appointment", "order"], required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Appointment or Order id

    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    method: { type: String, enum: ["razorpay", "cod"], required: true },

    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },

    status: {
      type: String,
      enum: ["created", "authorized", "captured", "failed", "refunded", "cod_pending", "cod_collected"],
      default: "created",
    },

    failureReason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
