const DoctorProfile = require("../models/DoctorProfile");
const User = require("../models/User");

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

    let query = DoctorProfile.find(filter).populate("user", "name avatarUrl");
    if (search) {
      const users = await User.find({ name: new RegExp(search, "i") }).select("_id");
      query = DoctorProfile.find({ ...filter, user: { $in: users.map((u) => u._id) } }).populate(
        "user",
        "name avatarUrl"
      );
    }

    const doctors = await query.sort({ ratingAverage: -1 }).limit(100);
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

module.exports = { submitOnboarding, getMyProfile, listApprovedDoctors, getDoctorPublicProfile };
