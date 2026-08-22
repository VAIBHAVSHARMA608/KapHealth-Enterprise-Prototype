const Appointment = require("../models/Appointment");
const User = require("../models/User");
const { notify } = require("../utils/notify");

const CHECK_INTERVAL_MS = 60 * 1000; // check every minute
const REMINDER_WINDOW_MS = 15 * 60 * 1000; // remind ~15 min before start

async function sendDueReminders() {
  try {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_MS);

    const due = await Appointment.find({
      status: "confirmed",
      scheduledStart: { $gte: now, $lte: windowEnd },
      reminderSentAt: null,
    });

    for (const appointment of due) {
      const [patientUser, doctorUser] = await Promise.all([
        User.findById(appointment.patient),
        User.findById(appointment.doctor),
      ]);

      await notify({
        user: appointment.patient,
        type: "appointment_reminder",
        title: "Your consult starts soon",
        message: `Your consult with Dr. ${doctorUser?.name || ""} starts at ${appointment.scheduledStart.toLocaleTimeString()}.`,
        relatedType: "appointment",
        relatedId: appointment._id,
        channels: { email: true },
        email: patientUser?.email,
      });
      await notify({
        user: appointment.doctor,
        type: "appointment_reminder",
        title: "Upcoming consult",
        message: `Your consult with ${patientUser?.name || "a patient"} starts at ${appointment.scheduledStart.toLocaleTimeString()}.`,
        relatedType: "appointment",
        relatedId: appointment._id,
        channels: { email: true },
        email: doctorUser?.email,
      });

      appointment.reminderSentAt = new Date();
      await appointment.save();
    }

    if (due.length) console.log(`[reminders] sent for ${due.length} upcoming appointment(s)`);
  } catch (err) {
    console.error("[reminders] job failed (non-fatal):", err.message);
  }
}

function startAppointmentReminderJob() {
  setInterval(sendDueReminders, CHECK_INTERVAL_MS);
  console.log("[reminders] appointment reminder job started (checks every 60s)");
}

module.exports = { startAppointmentReminderJob };
