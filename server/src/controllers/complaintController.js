const Complaint = require("../models/Complaint");

/** Either a patient or a doctor can raise a complaint/support ticket. */
async function createComplaint(req, res, next) {
  try {
    const complaint = await Complaint.create({
      author: req.user.id,
      authorRole: req.user.role,
      ...req.body,
    });
    res.status(201).json({ complaint });
  } catch (err) {
    next(err);
  }
}

async function listMyComplaints(req, res, next) {
  try {
    const complaints = await Complaint.find({ author: req.user.id }).sort({ createdAt: -1 });
    res.json({ complaints });
  } catch (err) {
    next(err);
  }
}

async function getMyComplaint(req, res, next) {
  try {
    const complaint = await Complaint.findOne({ _id: req.params.id, author: req.user.id });
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    res.json({ complaint });
  } catch (err) {
    next(err);
  }
}

module.exports = { createComplaint, listMyComplaints, getMyComplaint };
