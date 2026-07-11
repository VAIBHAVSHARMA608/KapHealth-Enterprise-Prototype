const { v4: uuidv4 } = require("uuid");
const Appointment = require("../models/Appointment");
const DoctorProfile = require("../models/DoctorProfile");
const Payment = require("../models/Payment");
const razorpay = require("../utils/razorpayClient");

/** Patient books a check-up slot. Creates a pending_payment appointment + Razorpay order. */
async function bookAppointment(req, res, next) {
  try {
    const { doctorId, scheduledStart, reasonForVisit } = req.body;

    const doctorProfile = await DoctorProfile.findOne({ user: doctorId, onboardingStatus: "approved" });
    if (!doctorProfile) return res.status(404).json({ message: "Doctor not available for booking" });

    const start = new Date(scheduledStart);
    const end = new Date(start.getTime() + 15 * 60 * 1000);

    // prevent double-booking the same slot
    const clash = await Appointment.findOne({
      doctor: doctorId,
      scheduledStart: start,
      status: { $in: ["pending_payment", "confirmed", "in_progress"] },
    });
    if (clash) return res.status(409).json({ message: "This slot was just taken, please pick another" });

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      scheduledStart: start,
      scheduledEnd: end,
      reasonForVisit,
      consultationFee: doctorProfile.consultationFee,
      roomId: `apt_${uuidv4()}`,
    });

    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(doctorProfile.consultationFee * 100), // paise
      currency: "INR",
      receipt: `appointment_${appointment._id}`,
    });

    const payment = await Payment.create({
      user: req.user.id,
      purpose: "appointment",
      referenceId: appointment._id,
      amount: doctorProfile.consultationFee,
      method: "razorpay",
      razorpayOrderId: rzpOrder.id,
      status: "created",
    });

    appointment.payment = payment._id;
    await appointment.save();

    res.status(201).json({
      appointment,
      razorpayOrderId: rzpOrder.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      amount: rzpOrder.amount,
    });
  } catch (err) {
    next(err);
  }
}

async function listMyAppointments(req, res, next) {
  try {
    const role = req.user.role; // "patient" | "doctor"
    const filter = role === "doctor" ? { doctor: req.user.id } : { patient: req.user.id };
    const appointments = await Appointment.find(filter)
      .populate("patient", "name avatarUrl")
      .populate("doctor", "name avatarUrl")
      .sort({ scheduledStart: -1 });
    res.json({ appointments });
  } catch (err) {
    next(err);
  }
}

async function getAppointment(req, res, next) {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "name avatarUrl")
      .populate("doctor", "name avatarUrl")
      .populate("prescription");
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const isParticipant =
      appointment.patient._id.toString() === req.user.id || appointment.doctor._id.toString() === req.user.id;
    if (!isParticipant) return res.status(403).json({ message: "Not your appointment" });

    res.json({ appointment });
  } catch (err) {
    next(err);
  }
}

/** Issues a short-lived room token proving this user may join this appointment's video room. */
async function getRoomAccess(req, res, next) {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const isParticipant =
      appointment.patient.toString() === req.user.id || appointment.doctor.toString() === req.user.id;
    if (!isParticipant) return res.status(403).json({ message: "Not your appointment" });

    if (appointment.status === "confirmed") {
      appointment.status = "in_progress";
      appointment.callStartedAt = new Date();
      await appointment.save();
    }

    res.json({
      roomId: appointment.roomId,
      // STUN/TURN config the client passes straight into RTCPeerConnection
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        ...(process.env.TURN_URLS
          ? [
              {
                urls: process.env.TURN_URLS,
                username: process.env.TURN_USERNAME,
                credential: process.env.TURN_CREDENTIAL,
              },
            ]
          : []),
      ],
    });
  } catch (err) {
    next(err);
  }
}

async function endCall(req, res, next) {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    appointment.status = "completed";
    appointment.callEndedAt = new Date();
    await appointment.save();
    res.json({ appointment });
  } catch (err) {
    next(err);
  }
}

async function cancelAppointment(req, res, next) {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    appointment.status = "cancelled";
    appointment.cancelledBy = req.user.role;
    appointment.cancellationReason = req.body.reason || "";
    await appointment.save();
    res.json({ appointment });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  bookAppointment,
  listMyAppointments,
  getAppointment,
  getRoomAccess,
  endCall,
  cancelAppointment,
};
