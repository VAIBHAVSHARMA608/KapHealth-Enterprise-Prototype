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
    // Dependents have their own dedicated endpoints below -- never let a
    // generic profile PATCH silently overwrite the whole array.
    const { dependents, ...safeBody } = req.body;
    const profile = await PatientProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: safeBody },
      { new: true, upsert: true }
    );
    res.json({ profile });
  } catch (err) {
    next(err);
  }
}

// ---- Phase 3: dependents (family members) ----
async function addDependent(req, res, next) {
  try {
    const profile = await PatientProfile.findOneAndUpdate(
      { user: req.user.id },
      { $push: { dependents: req.body } },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json({ profile });
  } catch (err) {
    next(err);
  }
}

async function updateDependent(req, res, next) {
  try {
    const profile = await PatientProfile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    const dependent = profile.dependents.id(req.params.dependentId);
    if (!dependent) return res.status(404).json({ message: "Dependent not found" });
    Object.assign(dependent, req.body);
    await profile.save();
    res.json({ profile });
  } catch (err) {
    next(err);
  }
}

async function removeDependent(req, res, next) {
  try {
    const profile = await PatientProfile.findOneAndUpdate(
      { user: req.user.id },
      { $pull: { dependents: { _id: req.params.dependentId } } },
      { new: true }
    );
    res.json({ profile });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyProfile, updateMyProfile, addDependent, updateDependent, removeDependent };
