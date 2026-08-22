const mongoose = require("mongoose");

const labTestBookingSchema = new mongoose.Schema(
  {
    bookingNumber: { type: String, required: true, unique: true }, // e.g. KAP-LAB-000123
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    bookingFor: {
      type: { type: String, enum: ["self", "dependent"], default: "self" },
      dependentId: { type: mongoose.Schema.Types.ObjectId, default: null },
      dependentName: { type: String, default: null },
    },

    tests: [
      {
        labTest: { type: mongoose.Schema.Types.ObjectId, ref: "LabTest", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],

    scheduledDate: { type: Date, required: true },
    timeSlot: { type: String, required: true }, // e.g. "08:00 AM - 10:00 AM"
    collectionAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      phone: String,
    },

    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },

    paymentMethod: { type: String, enum: ["cod", "online"], required: true },
    paymentStatus: { type: String, enum: ["pending", "cod_pending", "paid", "refunded"], default: "pending" },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },

    status: {
      type: String,
      enum: ["booked", "sample_collected", "processing", "report_ready", "cancelled"],
      default: "booked",
      index: true,
    },
    statusHistory: [
      {
        status: String,
        note: String,
        at: { type: Date, default: Date.now },
      },
    ],

    reportUrl: { type: String },
    reportGeneratedAt: { type: Date },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LabTestBooking", labTestBookingSchema);
