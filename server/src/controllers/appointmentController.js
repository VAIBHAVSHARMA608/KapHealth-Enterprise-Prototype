const { v4: uuidv4 } = require("uuid");
const Appointment = require("../models/Appointment");
const DoctorProfile = require("../models/DoctorProfile");
const Payment = require("../models/Payment");
const User = require("../models/User");
const { createPaymentIntent } = require("../utils/paymentFlow");
const { notify } = require("../utils/notify");

/** Patient books a check-up slot. Creates a pending_payment appointment + Razorpay order (or auto-confirms in dev mode). */
async function bookAppointment(req, res, next) {
  try {
    const { doctorId, scheduledStart, reasonForVisit, bookingFor } = req.body;

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
      bookingFor: bookingFor?.type === "dependent"
        ? { type: "dependent", dependentId: bookingFor.dependentId, dependentName: bookingFor.dependentName }
        : { type: "self" },
    });

    const intent = await createPaymentIntent({
      amountRupees: doctorProfile.consultationFee,
      receipt: `appointment_${appointment._id}`,
    });

    const payment = await Payment.create({
      user: req.user.id,
      purpose: "appointment",
      referenceId: appointment._id,
      amount: doctorProfile.consultationFee,
      method: "razorpay",
      razorpayOrderId: intent.razorpayOrderId,
      razorpayPaymentId: intent.razorpayPaymentId,
      status: intent.devMode ? "captured" : "created",
    });

    appointment.payment = payment._id;
    if (intent.devMode) {
      appointment.paymentStatus = "paid";
      appointment.status = "confirmed";
    }
    await appointment.save();

    if (intent.devMode) {
      const [patientUser, doctorUser] = await Promise.all([
        User.findById(req.user.id),
        User.findById(doctorId),
      ]);
      const forWhom = appointment.bookingFor.type === "dependent" ? ` for ${appointment.bookingFor.dependentName}` : "";
      await notify({
        user: doctorId,
        type: "appointment_booked",
        title: "New appointment booked",
        message: `${patientUser?.name || "A patient"} booked a consult${forWhom} on ${start.toLocaleString()}.`,
        relatedType: "appointment",
        relatedId: appointment._id,
        channels: { email: true },
        email: doctorUser?.email,
      });
      await notify({
        user: req.user.id,
        type: "appointment_confirmed",
        title: "Appointment confirmed",
        message: `Your consult with Dr. ${doctorUser?.name || ""}${forWhom} is confirmed for ${start.toLocaleString()}.`,
        relatedType: "appointment",
        relatedId: appointment._id,
        channels: { email: true },
        email: patientUser?.email,
      });
    }

    res.status(201).json({
      appointment,
      devMode: intent.devMode,
      razorpayOrderId: intent.razorpayOrderId,
      razorpayKeyId: intent.razorpayKeyId,
      amount: intent.amount,
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

    const otherPartyId = req.user.role === "patient" ? appointment.doctor : appointment.patient;
    const otherPartyUser = await User.findById(otherPartyId);
    await notify({
      user: otherPartyId,
      type: "appointment_cancelled",
      title: "Appointment cancelled",
      message: `The consult scheduled for ${appointment.scheduledStart.toLocaleString()} was cancelled by the ${req.user.role}${req.body.reason ? `: "${req.body.reason}"` : "."}`,
      relatedType: "appointment",
      relatedId: appointment._id,
      channels: { email: true },
      email: otherPartyUser?.email,
    });

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
