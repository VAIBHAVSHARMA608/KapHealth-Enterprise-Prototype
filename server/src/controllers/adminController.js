const mongoose = require("mongoose");
const DoctorProfile = require("../models/DoctorProfile");
const Order = require("../models/Order");
const Complaint = require("../models/Complaint");
const Appointment = require("../models/Appointment");
const Payment = require("../models/Payment");
const User = require("../models/User");
const Faq = require("../models/Faq");
const Review = require("../models/Review");
const Medicine = require("../models/Medicine");
const Coupon = require("../models/Coupon");
const LabTest = require("../models/LabTest");
const LabTestBooking = require("../models/LabTestBooking");
const Payout = require("../models/Payout");
const WorkoutTemplate = require("../models/WorkoutTemplate");
const FoodItem = require("../models/FoodItem");
const WellnessTip = require("../models/WellnessTip");
const { notify } = require("../utils/notify");

/** High-level counters for the admin dashboard home screen. */
async function getDashboardStats(req, res, next) {
  try {
    const [pendingDoctors, openComplaints, ordersToday, totalPatients, totalDoctors, revenueAgg, activeMedicines, activeCoupons, storeOrdersToday, pendingLabBookings, pendingPayouts] =
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
        Medicine.countDocuments({ isActive: true }),
        Coupon.countDocuments({ isActive: true }),
        Order.countDocuments({ orderSource: "store", createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
        LabTestBooking.countDocuments({ status: { $in: ["booked", "sample_collected", "processing"] } }),
        Payout.countDocuments({ status: "pending" }),
      ]);

    res.json({
      pendingDoctors,
      openComplaints,
      ordersToday,
      totalPatients,
      totalDoctors,
      totalRevenue: revenueAgg[0]?.total || 0,
      activeMedicines,
      activeCoupons,
      storeOrdersToday,
      pendingLabBookings,
      pendingPayouts,
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

    const doctorUser = await User.findById(profile.user);
    const decisionCopy = {
      approved: { type: "doctor_application_approved", title: "You're approved!", message: "Your KapHealth doctor application has been approved. You can now accept bookings." },
      rejected: { type: "doctor_application_rejected", title: "Application update", message: `Your application was not approved.${note ? ` Reason: ${note}` : ""}` },
      changes_requested: { type: "doctor_application_changes_requested", title: "Changes requested", message: `Please update your application.${note ? ` Note: ${note}` : ""}` },
    }[decision];
    if (decisionCopy && doctorUser) {
      await notify({
        user: doctorUser._id,
        ...decisionCopy,
        relatedType: "doctorProfile",
        relatedId: profile._id,
        channels: { email: true },
        email: doctorUser.email,
      });
    }

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

    const notifyCopy = {
      shipped: { type: "order_shipped", title: "Your order has shipped", message: `Order ${order.orderNumber} is on its way${trackingId ? ` (tracking: ${trackingId})` : ""}.` },
      out_for_delivery: { type: "order_shipped", title: "Out for delivery", message: `Order ${order.orderNumber} is out for delivery today.` },
      delivered: { type: "order_delivered", title: "Order delivered", message: `Order ${order.orderNumber} has been delivered. We hope you feel better soon!` },
      cancelled: { type: "general", title: "Order cancelled", message: `Order ${order.orderNumber} was cancelled.${note ? ` ${note}` : ""}` },
    }[status];
    if (notifyCopy) {
      const patientUser = await User.findById(order.patient);
      await notify({
        user: order.patient,
        ...notifyCopy,
        relatedType: "order",
        relatedId: order._id,
        channels: { email: true },
        email: patientUser?.email,
      });
    }

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

    if (message) {
      const authorUser = await User.findById(complaint.author);
      await notify({
        user: complaint.author,
        type: "complaint_response",
        title: `Update on: ${complaint.subject}`,
        message,
        relatedType: "complaint",
        relatedId: complaint._id,
        channels: { email: true },
        email: authorUser?.email,
      });
    }

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

// ---- Medicine catalog management ----
async function listAllMedicines(req, res, next) {
  try {
    const medicines = await Medicine.find({}).sort({ category: 1, name: 1 });
    res.json({ medicines });
  } catch (err) {
    next(err);
  }
}

async function createMedicine(req, res, next) {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json({ medicine });
  } catch (err) {
    next(err);
  }
}

async function updateMedicine(req, res, next) {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!medicine) return res.status(404).json({ message: "Medicine not found" });
    res.json({ medicine });
  } catch (err) {
    next(err);
  }
}

async function deleteMedicine(req, res, next) {
  try {
    // Soft delete -- keeps historical order line items intact.
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!medicine) return res.status(404).json({ message: "Medicine not found" });
    res.json({ message: "Medicine deactivated", medicine });
  } catch (err) {
    next(err);
  }
}

// ---- Coupon management ----
async function listAllCoupons(req, res, next) {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json({ coupons });
  } catch (err) {
    next(err);
  }
}

async function createCoupon(req, res, next) {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ coupon });
  } catch (err) {
    next(err);
  }
}

async function updateCoupon(req, res, next) {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json({ coupon });
  } catch (err) {
    next(err);
  }
}

async function deleteCoupon(req, res, next) {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: "Coupon deleted" });
  } catch (err) {
    next(err);
  }
}

// ---- Lab test catalog management ----
async function listAllLabTests(req, res, next) {
  try {
    const tests = await LabTest.find({}).sort({ category: 1, name: 1 });
    res.json({ tests });
  } catch (err) {
    next(err);
  }
}

async function createLabTest(req, res, next) {
  try {
    const test = await LabTest.create(req.body);
    res.status(201).json({ test });
  } catch (err) {
    next(err);
  }
}

async function updateLabTest(req, res, next) {
  try {
    const test = await LabTest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!test) return res.status(404).json({ message: "Test not found" });
    res.json({ test });
  } catch (err) {
    next(err);
  }
}

async function deleteLabTest(req, res, next) {
  try {
    const test = await LabTest.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!test) return res.status(404).json({ message: "Test not found" });
    res.json({ message: "Test deactivated", test });
  } catch (err) {
    next(err);
  }
}

// ---- Lab booking management ----
async function listAllLabBookings(req, res, next) {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const bookings = await LabTestBooking.find(filter).populate("patient", "name phone email").sort({ createdAt: -1 }).limit(200);
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
}

async function updateLabBookingStatus(req, res, next) {
  try {
    const { status, note, reportUrl } = req.body;
    const booking = await LabTestBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = status;
    if (reportUrl) {
      booking.reportUrl = reportUrl;
      booking.reportGeneratedAt = new Date();
    }
    booking.statusHistory.push({ status, note });
    await booking.save();

    const copy = {
      sample_collected: { title: "Sample collected", message: `Your sample for booking ${booking.bookingNumber} has been collected.` },
      processing: { title: "Report in progress", message: `Your tests for booking ${booking.bookingNumber} are being processed.` },
      report_ready: { title: "Your report is ready", message: `Your report for booking ${booking.bookingNumber} is ready to view.` },
      cancelled: { title: "Booking cancelled", message: `Booking ${booking.bookingNumber} was cancelled.${note ? ` ${note}` : ""}` },
    }[status];
    if (copy) {
      const patientUser = await User.findById(booking.patient);
      await notify({
        user: booking.patient,
        type: status === "report_ready" ? "lab_report_ready" : "general",
        ...copy,
        relatedType: "labBooking",
        relatedId: booking._id,
        channels: { email: true },
        email: patientUser?.email,
      });
    }

    res.json({ booking });
  } catch (err) {
    next(err);
  }
}

// ---- Doctor payouts ----
async function listPayouts(req, res, next) {
  try {
    const { status, doctorId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (doctorId) filter.doctor = doctorId;
    const payouts = await Payout.find(filter).populate("doctor", "name email phone").sort({ createdAt: -1 }).limit(200);
    res.json({ payouts });
  } catch (err) {
    next(err);
  }
}

/** Computes a doctor's completed-consult earnings for a period and creates a pending payout. */
async function generatePayout(req, res, next) {
  try {
    const { doctorId, periodStart, periodEnd, platformFeePercent = 15 } = req.body;
    const start = new Date(periodStart);
    const end = new Date(periodEnd);

    const agg = await Appointment.aggregate([
      { $match: { doctor: new mongoose.Types.ObjectId(doctorId), status: "completed", paymentStatus: "paid", scheduledStart: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: "$consultationFee" }, count: { $sum: 1 } } },
    ]);
    const grossAmount = agg[0]?.total || 0;
    const consultationCount = agg[0]?.count || 0;
    if (consultationCount === 0) {
      return res.status(400).json({ message: "No completed, paid consultations in this period" });
    }
    const platformFee = Math.round((grossAmount * platformFeePercent) / 100);
    const netAmount = grossAmount - platformFee;

    const payout = await Payout.create({
      doctor: doctorId,
      periodStart: start,
      periodEnd: end,
      consultationCount,
      grossAmount,
      platformFeePercent,
      platformFee,
      netAmount,
      status: "pending",
    });

    res.status(201).json({ payout });
  } catch (err) {
    next(err);
  }
}

async function updatePayoutStatus(req, res, next) {
  try {
    const { status, transactionRef, note } = req.body;
    const payout = await Payout.findById(req.params.id);
    if (!payout) return res.status(404).json({ message: "Payout not found" });

    payout.status = status;
    if (transactionRef) payout.transactionRef = transactionRef;
    if (note) payout.note = note;
    if (status === "paid") payout.paidAt = new Date();
    await payout.save();

    if (status === "paid") {
      const doctorUser = await User.findById(payout.doctor);
      await notify({
        user: payout.doctor,
        type: "payout_processed",
        title: "Payout processed",
        message: `₹${payout.netAmount} has been paid out for ${payout.periodStart.toLocaleDateString()} - ${payout.periodEnd.toLocaleDateString()}.`,
        relatedType: "payout",
        relatedId: payout._id,
        channels: { email: true },
        email: doctorUser?.email,
      });
    }

    res.json({ payout });
  } catch (err) {
    next(err);
  }
}

// ---- Analytics dashboard ----
async function getAnalytics(req, res, next) {
  try {
    const days = Math.min(90, Number(req.query.days) || 30);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    since.setHours(0, 0, 0, 0);

    const [revenueByDay, appointmentsByDay, topDoctors, orderRevenue, labRevenue, appointmentRevenue, ordersByStatus, labByStatus] = await Promise.all([
      Payment.aggregate([
        { $match: { status: { $in: ["captured", "cod_collected"] }, createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, total: { $sum: "$amount" } } },
        { $sort: { _id: 1 } },
      ]),
      Appointment.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Appointment.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: "$doctor", earnings: { $sum: "$consultationFee" }, consults: { $sum: 1 } } },
        { $sort: { earnings: -1 } },
        { $limit: 5 },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "doctor" } },
        { $unwind: "$doctor" },
        { $project: { doctorName: "$doctor.name", earnings: 1, consults: 1 } },
      ]),
      Order.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
      LabTestBooking.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
      Appointment.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: "$consultationFee" } } }]),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      LabTestBooking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);

    res.json({
      revenueByDay: revenueByDay.map((r) => ({ date: r._id, total: r.total })),
      appointmentsByDay: appointmentsByDay.map((a) => ({ date: a._id, count: a.count })),
      topDoctors,
      revenueBreakdown: {
        orders: orderRevenue[0]?.total || 0,
        labTests: labRevenue[0]?.total || 0,
        appointments: appointmentRevenue[0]?.total || 0,
      },
      ordersByStatus: ordersByStatus.map((o) => ({ status: o._id, count: o.count })),
      labBookingsByStatus: labByStatus.map((l) => ({ status: l._id, count: l.count })),
    });
  } catch (err) {
    next(err);
  }
}

// ---- Wellness: workout template catalog ----
async function listAllWorkoutTemplates(req, res, next) {
  try {
    const templates = await WorkoutTemplate.find({}).sort({ sport: 1, level: 1 });
    res.json({ templates });
  } catch (err) {
    next(err);
  }
}

async function createWorkoutTemplate(req, res, next) {
  try {
    const template = await WorkoutTemplate.create(req.body);
    res.status(201).json({ template });
  } catch (err) {
    next(err);
  }
}

async function updateWorkoutTemplate(req, res, next) {
  try {
    const template = await WorkoutTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!template) return res.status(404).json({ message: "Template not found" });
    res.json({ template });
  } catch (err) {
    next(err);
  }
}

async function deleteWorkoutTemplate(req, res, next) {
  try {
    const template = await WorkoutTemplate.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!template) return res.status(404).json({ message: "Template not found" });
    res.json({ message: "Template deactivated", template });
  } catch (err) {
    next(err);
  }
}

// ---- Wellness: food catalog ----
async function listAllFoods(req, res, next) {
  try {
    const foods = await FoodItem.find({}).sort({ category: 1, name: 1 });
    res.json({ foods });
  } catch (err) {
    next(err);
  }
}

async function createFood(req, res, next) {
  try {
    const food = await FoodItem.create(req.body);
    res.status(201).json({ food });
  } catch (err) {
    next(err);
  }
}

async function updateFood(req, res, next) {
  try {
    const food = await FoodItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!food) return res.status(404).json({ message: "Food item not found" });
    res.json({ food });
  } catch (err) {
    next(err);
  }
}

async function deleteFood(req, res, next) {
  try {
    await FoodItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Food item deleted" });
  } catch (err) {
    next(err);
  }
}

// ---- Wellness: tips ----
async function listAllWellnessTips(req, res, next) {
  try {
    const tips = await WellnessTip.find({}).sort({ createdAt: -1 });
    res.json({ tips });
  } catch (err) {
    next(err);
  }
}

async function createWellnessTip(req, res, next) {
  try {
    const tip = await WellnessTip.create(req.body);
    res.status(201).json({ tip });
  } catch (err) {
    next(err);
  }
}

async function updateWellnessTip(req, res, next) {
  try {
    const tip = await WellnessTip.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!tip) return res.status(404).json({ message: "Tip not found" });
    res.json({ tip });
  } catch (err) {
    next(err);
  }
}

async function deleteWellnessTip(req, res, next) {
  try {
    await WellnessTip.findByIdAndDelete(req.params.id);
    res.json({ message: "Tip deleted" });
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
  listAllMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  listAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  listAllLabTests,
  createLabTest,
  updateLabTest,
  deleteLabTest,
  listAllLabBookings,
  updateLabBookingStatus,
  listPayouts,
  generatePayout,
  updatePayoutStatus,
  getAnalytics,
  listAllWorkoutTemplates,
  createWorkoutTemplate,
  updateWorkoutTemplate,
  deleteWorkoutTemplate,
  listAllFoods,
  createFood,
  updateFood,
  deleteFood,
  listAllWellnessTips,
  createWellnessTip,
  updateWellnessTip,
  deleteWellnessTip,
};
