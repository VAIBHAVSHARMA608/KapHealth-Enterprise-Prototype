const mongoose = require("mongoose");

/**
 * Support ticket raised by EITHER a patient or a doctor. Only visible to the
 * hidden admin panel and the author themselves.
 */
const complaintSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    authorRole: { type: String, enum: ["patient", "doctor"], required: true },

    category: {
      type: String,
      enum: [
        "appointment_issue",
        "video_call_issue",
        "prescription_issue",
        "order_delivery_issue",
        "payment_issue",
        "account_issue",
        "other",
      ],
      required: true,
    },
    relatedAppointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    relatedOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },

    subject: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 3000 },
    attachments: [{ type: String }],

    status: {
      type: String,
      enum: ["open", "in_review", "resolved", "closed"],
      default: "open",
      index: true,
    },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },

    adminResponses: [
      {
        message: String,
        respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        at: { type: Date, default: Date.now },
      },
    ],
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
