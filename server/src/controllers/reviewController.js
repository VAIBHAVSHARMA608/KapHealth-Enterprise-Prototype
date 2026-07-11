const Review = require("../models/Review");
const Order = require("../models/Order");
const Appointment = require("../models/Appointment");
const DoctorProfile = require("../models/DoctorProfile");

/** Patient reviews a doctor after a completed appointment, or a delivered order. */
async function createReview(req, res, next) {
  try {
    const { targetType, targetId, rating, comment } = req.body;

    if (targetType === "doctor") {
      const appointment = await Appointment.findOne({
        doctor: targetId,
        patient: req.user.id,
        status: "completed",
      });
      if (!appointment) return res.status(403).json({ message: "Complete a consult before reviewing" });

      const review = await Review.create({
        author: req.user.id,
        targetType: "doctor",
        doctor: targetId,
        appointment: appointment._id,
        rating,
        comment,
      });

      const doctorProfile = await DoctorProfile.findOne({ user: targetId });
      const newCount = doctorProfile.ratingCount + 1;
      const newAvg = (doctorProfile.ratingAverage * doctorProfile.ratingCount + rating) / newCount;
      doctorProfile.ratingCount = newCount;
      doctorProfile.ratingAverage = Math.round(newAvg * 10) / 10;
      await doctorProfile.save();

      return res.status(201).json({ review });
    }

    if (targetType === "order") {
      const order = await Order.findOne({ _id: targetId, patient: req.user.id, status: "delivered" });
      if (!order) return res.status(403).json({ message: "Order must be delivered before reviewing" });

      const review = await Review.create({
        author: req.user.id,
        targetType: "order",
        order: order._id,
        rating,
        comment,
      });
      order.review = review._id;
      await order.save();
      return res.status(201).json({ review });
    }

    res.status(400).json({ message: "Invalid targetType" });
  } catch (err) {
    next(err);
  }
}

async function listDoctorReviews(req, res, next) {
  try {
    const reviews = await Review.find({ doctor: req.params.doctorId, targetType: "doctor", isHidden: false })
      .populate("author", "name avatarUrl")
      .sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
}

module.exports = { createReview, listDoctorReviews };
