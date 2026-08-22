const mongoose = require("mongoose");

/**
 * A booked check-up session. Drives the whole "book -> video call -> prescription" flow.
 */
const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    scheduledStart: { type: Date, required: true },
    scheduledEnd: { type: Date, required: true },

    reasonForVisit: { type: String, maxlength: 500 },

    status: {
      type: String,
      enum: [
        "pending_payment", // slot held, awaiting payment confirmation
        "confirmed",       // paid / booked, upcoming
        "in_progress",     // video room active
        "completed",       // consult finished, prescription may or may not exist yet
        "cancelled",
        "no_show",
      ],
      default: "pending_payment",
      index: true,
    },

    consultationFee: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded", "failed"],
      default: "unpaid",
    },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },

    // Video/chat room identifiers (socket.io room name), never guessable
    roomId: { type: String, required: true, unique: true },

    callStartedAt: { type: Date },
    callEndedAt: { type: Date },

    prescription: { type: mongoose.Schema.Types.ObjectId, ref: "Prescription" },

    cancelledBy: { type: String, enum: ["patient", "doctor", "admin", null], default: null },
    cancellationReason: { type: String },

    reminderSentAt: { type: Date, default: null },

    // Phase 3: a patient can book a consult on behalf of a family member.
    bookingFor: {
      type: { type: String, enum: ["self", "dependent"], default: "self" },
      dependentId: { type: mongoose.Schema.Types.ObjectId, default: null }, // matches PatientProfile.dependents._id
      dependentName: { type: String, default: null }, // snapshot, in case the dependent is later edited/removed
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ doctor: 1, scheduledStart: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
