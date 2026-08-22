const Prescription = require("../models/Prescription");
const Appointment = require("../models/Appointment");
const DoctorProfile = require("../models/DoctorProfile");
const User = require("../models/User");
const { generatePrescriptionPdf } = require("../utils/generatePrescriptionPdf");
const { notify } = require("../utils/notify");

/** Doctor issues an e-prescription at the end of (or during) a video consult. */
async function createPrescription(req, res, next) {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the consulting doctor can issue this prescription" });
    }
    if (appointment.prescription) {
      return res.status(409).json({ message: "Prescription already issued for this appointment" });
    }

    const prescription = await Prescription.create({
      appointment: appointment._id,
      patient: appointment.patient,
      doctor: appointment.doctor,
      ...req.body,
    });

    const [doctor, doctorProfile, patient] = await Promise.all([
      User.findById(appointment.doctor),
      DoctorProfile.findOne({ user: appointment.doctor }),
      User.findById(appointment.patient),
    ]);

    const pdfUrl = await generatePrescriptionPdf({ prescription, doctor, doctorProfile, patient });
    prescription.pdfUrl = pdfUrl;
    await prescription.save();

    appointment.prescription = prescription._id;
    appointment.status = "completed";
    if (!appointment.callEndedAt) appointment.callEndedAt = new Date();
    await appointment.save();

    await notify({
      user: appointment.patient,
      type: "prescription_ready",
      title: "Your e-prescription is ready",
      message: `Dr. ${doctor?.name || ""} has issued your prescription. You can view or order the medicines now.`,
      relatedType: "prescription",
      relatedId: prescription._id,
      channels: { email: true },
      email: patient?.email,
    });

    res.status(201).json({ prescription });
  } catch (err) {
    next(err);
  }
}

async function getPrescription(req, res, next) {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ message: "Prescription not found" });
    const isParticipant =
      prescription.patient.toString() === req.user.id || prescription.doctor.toString() === req.user.id;
    if (!isParticipant) return res.status(403).json({ message: "Not authorized" });
    res.json({ prescription });
  } catch (err) {
    next(err);
  }
}

async function listMyPrescriptions(req, res, next) {
  try {
    const filter = req.user.role === "doctor" ? { doctor: req.user.id } : { patient: req.user.id };
    const prescriptions = await Prescription.find(filter).sort({ createdAt: -1 });
    res.json({ prescriptions });
  } catch (err) {
    next(err);
  }
}

module.exports = { createPrescription, getPrescription, listMyPrescriptions };
