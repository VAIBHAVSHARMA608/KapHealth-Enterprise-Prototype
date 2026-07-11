const DoctorProfile = require("../models/DoctorProfile");
const Order = require("../models/Order");
const Complaint = require("../models/Complaint");
const Appointment = require("../models/Appointment");
const Payment = require("../models/Payment");
const User = require("../models/User");
const Faq = require("../models/Faq");
const Review = require("../models/Review");

/** High-level counters for the admin dashboard home screen. */
async function getDashboardStats(req, res, next) {
  try {
    const [pendingDoctors, openComplaints, ordersToday, totalPatients, totalDoctors, revenueAgg] =
      await Promise.all([
        DoctorProfile.countDocuments({ onboardingStatus: "pending_review" }),
        Complaint.countDocuments({ status: { $in: ["open", "in_review"] } }),
        Order.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
        User.countDocuments({ role: "patient" }),
        User.countDocuments({ role: "doctor" }),
        Payment.aggregate([
          { $match: { status: { $in: ["captured", "cod_collected"] } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
      ]);

    res.json({
      pendingDoctors,
      openComplaints,
      ordersToday,
      totalPatients,
      totalDoctors,
      totalRevenue: revenueAgg[0]?.total || 0,
    });
  } catch (err) {
    next(err);
  }
}

// ---- Doctor onboarding review ----
async function listDoctorApplications(req, res, next) {
  try {
    const { status } = req.query; // pending_review | approved | rejected | changes_requested
    const filter = status ? { onboardingStatus: status } : {};
    const applications = await DoctorProfile.find(filter)
      .populate("user", "name email phone createdAt")
      .sort({ createdAt: -1 });
    res.json({ applications });
  } catch (err) {
    next(err);
  }
}

async function reviewDoctorApplication(req, res, next) {
  try {
    const { decision, note } = req.body; // decision: approved | rejected | changes_requested
    const profile = await DoctorProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: "Application not found" });

    profile.onboardingStatus = decision;
    profile.adminReviewNote = note || "";
    profile.reviewedBy = req.user.id;
    profile.reviewedAt = new Date();
    await profile.save();

    res.json({ profile });
  } catch (err) {
    next(err);
  }
}

// ---- Orders ----
async function listAllOrders(req, res, next) {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter).populate("patient", "name phone").sort({ createdAt: -1 }).limit(200);
    res.json({ orders });
  } catch (err) {
    next(err);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { status, note, courierName, trackingId, estimatedDeliveryDate } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    if (courierName) order.courierName = courierName;
    if (trackingId) order.trackingId = trackingId;
    if (estimatedDeliveryDate) order.estimatedDeliveryDate = estimatedDeliveryDate;
    if (status === "delivered") {
      order.deliveredAt = new Date();
      if (order.paymentMethod === "cod") order.paymentStatus = "paid";
    }
    order.statusHistory.push({ status, note });
    await order.save();

    res.json({ order });
  } catch (err) {
    next(err);
  }
}

// ---- Complaints (from both patients and doctors) ----
async function listAllComplaints(req, res, next) {
  try {
    const { status, authorRole } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (authorRole) filter.authorRole = authorRole;
    const complaints = await Complaint.find(filter).populate("author", "name email phone role").sort({ createdAt: -1 });
    res.json({ complaints });
  } catch (err) {
    next(err);
  }
}

async function respondToComplaint(req, res, next) {
  try {
    const { message, status } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    if (message) {
      complaint.adminResponses.push({ message, respondedBy: req.user.id });
    }
    if (status) {
      complaint.status = status;
      if (status === "resolved") complaint.resolvedAt = new Date();
    }
    await complaint.save();
    res.json({ complaint });
  } catch (err) {
    next(err);
  }
}

// ---- FAQ management ----
async function createFaq(req, res, next) {
  try {
    const faq = await Faq.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ faq });
  } catch (err) {
    next(err);
  }
}

async function updateFaq(req, res, next) {
  try {
    const faq = await Faq.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ faq });
  } catch (err) {
    next(err);
  }
}

async function deleteFaq(req, res, next) {
  try {
    await Faq.findByIdAndDelete(req.params.id);
    res.json({ message: "FAQ deleted" });
  } catch (err) {
    next(err);
  }
}

// ---- Reviews moderation ----
async function listAllReviews(req, res, next) {
  try {
    const reviews = await Review.find({}).populate("author", "name").sort({ createdAt: -1 }).limit(200);
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
}

async function toggleReviewVisibility(req, res, next) {
  try {
    const review = await Review.findById(req.params.id);
    review.isHidden = !review.isHidden;
    await review.save();
    res.json({ review });
  } catch (err) {
    next(err);
  }
}

// ---- Appointments overview ----
async function listAllAppointments(req, res, next) {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const appointments = await Appointment.find(filter)
      .populate("patient", "name phone")
      .populate("doctor", "name")
      .sort({ scheduledStart: -1 })
      .limit(200);
    res.json({ appointments });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardStats,
  listDoctorApplications,
  reviewDoctorApplication,
  listAllOrders,
  updateOrderStatus,
  listAllComplaints,
  respondToComplaint,
  createFaq,
  updateFaq,
  deleteFaq,
  listAllReviews,
  toggleReviewVisibility,
  listAllAppointments,
};
