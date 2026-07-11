const mongoose = require("mongoose");

const ORDER_STATUSES = [
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
];

/**
 * A medicine order placed against an e-prescription.
 * statusHistory powers the "tracks his medicines" timeline UI.
 */
const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true }, // e.g. KAP-2026-000123
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    prescription: { type: mongoose.Schema.Types.ObjectId, ref: "Prescription", required: true },

    items: [
      {
        medicine: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true },
      },
    ],

    deliveryAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      phone: String,
    },

    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },

    paymentMethod: { type: String, enum: ["cod", "online"], required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "cod_pending"],
      default: "pending",
    },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },

    status: { type: String, enum: ORDER_STATUSES, default: "placed", index: true },
    statusHistory: [
      {
        status: { type: String, enum: ORDER_STATUSES },
        note: String,
        at: { type: Date, default: Date.now },
      },
    ],

    courierName: { type: String },
    trackingId: { type: String },
    estimatedDeliveryDate: { type: Date },
    deliveredAt: { type: Date },

    review: { type: mongoose.Schema.Types.ObjectId, ref: "Review" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
