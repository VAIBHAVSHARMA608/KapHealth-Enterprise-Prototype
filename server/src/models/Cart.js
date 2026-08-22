const mongoose = require("mongoose");

/**
 * One cart per patient, used only for OTC (requiresPrescription: false) essentials.
 * Prescription-only medicines are still ordered through the existing
 * prescription -> OrderMedicines flow, never through the cart.
 */
const cartSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    items: [
      {
        medicine: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
        quantity: { type: Number, required: true, min: 1, default: 1 },
      },
    ],
    couponCode: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
