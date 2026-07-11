const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/**
 * Renders a Prescription document to a PDF file on disk and returns the
 * relative URL. Uses pdfkit (no headless-browser dependency, so it runs
 * anywhere Node runs).
 */
async function generatePrescriptionPdf({ prescription, doctor, doctorProfile, patient }) {
  const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || "uploads", "prescriptions");
  fs.mkdirSync(uploadDir, { recursive: true });

  const fileName = `rx_${prescription._id}.pdf`;
  const filePath = path.join(uploadDir, fileName);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ---- Letterhead ----
    doc.fontSize(20).fillColor("#0F6E5B").text("KapHealth", { continued: true });
    doc.fontSize(10).fillColor("#6B8079").text("   e-Prescription", { align: "left" });
    doc.moveDown(0.5);
    doc.strokeColor("#0F6E5B").lineWidth(1.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    // ---- Doctor / patient meta ----
    doc.fontSize(11).fillColor("#10241F");
    doc.text(`Dr. ${doctor.name}`, { continued: true }).fillColor("#6B8079").text(`   ${(doctorProfile.specializations || []).join(", ")}`);
    doc.fillColor("#10241F").text(`Reg. No: ${doctorProfile.registrationNumber} (${doctorProfile.registrationCouncil})`);
    doc.moveDown(0.5);
    doc.text(`Patient: ${patient.name}`);
    doc.text(`Date: ${new Date(prescription.signedAt || Date.now()).toLocaleDateString()}`);
    doc.moveDown();

    if (prescription.diagnosis) {
      doc.font("Helvetica-Bold").text("Diagnosis");
      doc.font("Helvetica").text(prescription.diagnosis);
      doc.moveDown(0.5);
    }

    doc.font("Helvetica-Bold").text("Rx");
    doc.moveDown(0.3);
    prescription.medicines.forEach((m, i) => {
      doc
        .font("Helvetica-Bold")
        .text(`${i + 1}. ${m.name} - ${m.dosage}`, { continued: false });
      doc
        .font("Helvetica")
        .fillColor("#6B8079")
        .text(`   ${m.frequency} - ${m.durationDays} day(s)${m.instructions ? " - " + m.instructions : ""}`)
        .fillColor("#10241F");
      doc.moveDown(0.3);
    });

    if (prescription.notesForPatient) {
      doc.moveDown(0.5);
      doc.font("Helvetica-Bold").text("Notes");
      doc.font("Helvetica").text(prescription.notesForPatient);
    }

    if (prescription.followUpDate) {
      doc.moveDown(0.5);
      doc.font("Helvetica-Bold").text("Follow-up: ", { continued: true }).font("Helvetica").text(new Date(prescription.followUpDate).toLocaleDateString());
    }

    doc.moveDown(2);
    doc.fontSize(9).fillColor("#6B8079").text(
      "This is a digitally generated prescription issued via KapHealth telemedicine platform. " +
        "Verify doctor registration at your state medical council before dispensing if in doubt.",
      { width: 495 }
    );

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  return `/uploads/prescriptions/${fileName}`;
}

module.exports = { generatePrescriptionPdf };
