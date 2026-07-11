const mongoose = require("mongoose");

/**
 * Persisted transcript of the in-call text chat, so both parties (and the
 * hidden admin panel, for dispute/complaint review) can look back at it.
 */
const chatMessageSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: ["patient", "doctor"], required: true },
    text: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
