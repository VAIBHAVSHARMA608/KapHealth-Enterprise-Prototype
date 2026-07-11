const PatientProfile = require("../models/PatientProfile");

async function getMyProfile(req, res, next) {
  try {
    let profile = await PatientProfile.findOne({ user: req.user.id });
    if (!profile) profile = await PatientProfile.create({ user: req.user.id });
    res.json({ profile });
  } catch (err) {
    next(err);
  }
}

async function updateMyProfile(req, res, next) {
  try {
    const profile = await PatientProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json({ profile });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyProfile, updateMyProfile };
