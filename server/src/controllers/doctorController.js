const DoctorProfile = require("../models/DoctorProfile");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Payout = require("../models/Payout");

/** Doctor submits their onboarding form (vitals + professional details). */
async function submitOnboarding(req, res, next) {
  try {
    const existing = await DoctorProfile.findOne({ user: req.user.id });
    const files = req.files || {};
    const documents = {
      governmentId: files.governmentId?.[0]?.path,
      medicalRegistrationCertificate: files.medicalRegistrationCertificate?.[0]?.path,
      degreeCertificate: files.degreeCertificate?.[0]?.path,
      profilePhoto: files.profilePhoto?.[0]?.path,
    };

    if (existing) {
      Object.assign(existing, req.body, {
        documents: { ...existing.documents, ...documents },
        onboardingStatus: "pending_review", // re-submit resets to pending review
        adminReviewNote: undefined,
      });
      await existing.save();
      return res.json({ message: "Onboarding updated, pending review", profile: existing });
    }

    const profile = await DoctorProfile.create({
      user: req.user.id,
      ...req.body,
      documents,
    });
    res.status(201).json({ message: "Onboarding submitted, pending admin review", profile });
  } catch (err) {
    next(err);
  }
}

async function getMyProfile(req, res, next) {
  try {
    const profile = await DoctorProfile.findOne({ user: req.user.id }).populate("user", "name email phone avatarUrl");
    res.json({ profile });
  } catch (err) {
    next(err);
  }
}

/** Public: list only approved doctors, for patients to browse/book. */
async function listApprovedDoctors(req, res, next) {
  try {
    const { specialization, search } = req.query;
    const filter = { onboardingStatus: "approved" };
    if (specialization) filter.specializations = specialization;

    if (search) {
      // Matches by doctor name OR specialization/qualification, so searching
      // "Cardiologist" (a specialty) works the same as searching a doctor's name.
      const matchingUsers = await User.find({ name: new RegExp(search, "i"), role: "doctor" }).select("_id");
      filter.$or = [
        { user: { $in: matchingUsers.map((u) => u._id) } },
        { specializations: new RegExp(search, "i") },
        { qualifications: new RegExp(search, "i") },
      ];
    }

    const doctors = await DoctorProfile.find(filter).populate("user", "name avatarUrl").sort({ ratingAverage: -1 }).limit(100);
    res.json({ doctors });
  } catch (err) {
    next(err);
  }
}

async function getDoctorPublicProfile(req, res, next) {
  try {
    const profile = await DoctorProfile.findOne({
      user: req.params.doctorId,
      onboardingStatus: "approved",
    }).populate("user", "name avatarUrl");
    if (!profile) return res.status(404).json({ message: "Doctor not found" });
    res.json({ profile });
  } catch (err) {
    next(err);
  }
}

/** Doctor-facing earnings summary: totals + trend + payout history. */
async function getMyEarnings(req, res, next) {
  try {
    const doctorId = req.user.id;
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const completedFilter = { doctor: doctorId, status: "completed", paymentStatus: "paid" };

    const [totalAgg, weekAgg, monthAgg, payouts, recentAppointments] = await Promise.all([
      Appointment.aggregate([{ $match: completedFilter }, { $group: { _id: null, total: { $sum: "$consultationFee" }, count: { $sum: 1 } } }]),
      Appointment.aggregate([{ $match: { ...completedFilter, scheduledStart: { $gte: startOfWeek } } }, { $group: { _id: null, total: { $sum: "$consultationFee" }, count: { $sum: 1 } } }]),
      Appointment.aggregate([{ $match: { ...completedFilter, scheduledStart: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: "$consultationFee" }, count: { $sum: 1 } } }]),
      Payout.find({ doctor: doctorId }).sort({ periodEnd: -1 }).limit(20),
      Appointment.find(completedFilter).sort({ scheduledStart: -1 }).limit(10).populate("patient", "name"),
    ]);

    const lifetimePaidOut = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + p.netAmount, 0);
    const totalEarned = totalAgg[0]?.total || 0;
    const pendingPayout = Math.max(0, Math.round(totalEarned * 0.85) - lifetimePaidOut); // rough estimate at 15% platform fee

    res.json({
      totalEarned,
      totalConsultations: totalAgg[0]?.count || 0,
      thisWeek: { earned: weekAgg[0]?.total || 0, count: weekAgg[0]?.count || 0 },
      thisMonth: { earned: monthAgg[0]?.total || 0, count: monthAgg[0]?.count || 0 },
      lifetimePaidOut,
      estimatedPendingPayout: pendingPayout,
      payouts,
      recentAppointments,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitOnboarding, getMyProfile, listApprovedDoctors, getDoctorPublicProfile, getMyEarnings };
