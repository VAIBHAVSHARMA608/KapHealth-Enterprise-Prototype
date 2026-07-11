const Prescription = require("../models/Prescription");
const Appointment = require("../models/Appointment");
const DoctorProfile = require("../models/DoctorProfile");
const User = require("../models/User");
const { generatePrescriptionPdf } = require("../utils/generatePrescriptionPdf");

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
