const mongoose = require("mongoose");

/**
 * E-prescription written by the doctor at the end of / during a consult.
 * Rendered to a signed-looking PDF (see utils/generatePrescriptionPdf.js)
 * and linked from the patient's order flow ("click Order" uses these items).
 */
const prescriptionSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true, unique: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    diagnosis: { type: String, maxlength: 1000 },
    notesForPatient: { type: String, maxlength: 1000 },

    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true }, // "500mg"
        frequency: { type: String, required: true }, // "1-0-1 after food"
        durationDays: { type: Number, required: true },
        instructions: { type: String },
      },
    ],

    followUpDate: { type: Date },

    pdfUrl: { type: String }, // generated file path/url
    signedAt: { type: Date, default: Date.now },

    // set true once the patient has used "Order Medicines" against this prescription
    isOrdered: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);
