const mongoose = require("mongoose");

const healthRecordSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    recordType: {
      type: String,
      enum: ["lab_report", "prescription", "vaccination", "discharge_summary", "insurance", "scan_imaging", "other"],
      default: "other",
    },
    fileUrl: { type: String, required: true },
    recordDate: { type: Date, default: Date.now },
    notes: { type: String, maxlength: 500 },
    uploadedBy: { type: String, enum: ["patient", "doctor", "admin", "system"], default: "patient" },

    // Optional links back to what generated this record automatically
    // (e.g. a lab report or e-prescription created elsewhere in the app).
    relatedAppointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", default: null },
    relatedLabBooking: { type: mongoose.Schema.Types.ObjectId, ref: "LabTestBooking", default: null },

    // Whose record this is, for family vaults (matches PatientProfile.dependents._id).
    forDependentId: { type: mongoose.Schema.Types.ObjectId, default: null },
    forDependentName: { type: String, default: null },
  },
  { timestamps: true }
);

healthRecordSchema.index({ patient: 1, recordType: 1, recordDate: -1 });

module.exports = mongoose.model("HealthRecord", healthRecordSchema);
