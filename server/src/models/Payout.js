const mongoose = require("mongoose");

const payoutSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    consultationCount: { type: Number, required: true },
    grossAmount: { type: Number, required: true }, // sum of consultation fees in the period
    platformFeePercent: { type: Number, default: 15 },
    platformFee: { type: Number, required: true },
    netAmount: { type: Number, required: true }, // what the doctor actually receives
    status: { type: String, enum: ["pending", "processing", "paid", "failed"], default: "pending", index: true },
    transactionRef: { type: String },
    paidAt: { type: Date },
    note: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payout", payoutSchema);
