const mongoose = require("mongoose");

const NOTIFICATION_TYPES = [
  "appointment_booked",
  "appointment_confirmed",
  "appointment_reminder",
  "appointment_cancelled",
  "prescription_ready",
  "order_placed",
  "order_shipped",
  "order_delivered",
  "lab_booking_confirmed",
  "lab_report_ready",
  "doctor_application_approved",
  "doctor_application_rejected",
  "doctor_application_changes_requested",
  "complaint_response",
  "payout_processed",
  "general",
];

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, default: "general" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    // What this notification is about, for deep-linking from the bell dropdown.
    relatedType: { type: String, enum: ["appointment", "order", "prescription", "labBooking", "complaint", "doctorProfile", "payout", null], default: null },
    relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
    channels: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
    },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, readAt: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
