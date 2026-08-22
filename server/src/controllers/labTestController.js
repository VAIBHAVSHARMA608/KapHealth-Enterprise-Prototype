const LabTest = require("../models/LabTest");
const LabTestBooking = require("../models/LabTestBooking");
const User = require("../models/User");
const { createPaymentIntent } = require("../utils/paymentFlow");
const { generateLabBookingNumber } = require("../utils/orderNumber");
const { notify } = require("../utils/notify");
const Payment = require("../models/Payment");

// ---- Public catalog ----
async function listTests(req, res, next) {
  try {
    const { search, category, sort = "popular", page = 1, limit = 24 } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (search) filter.$or = [{ name: new RegExp(search, "i") }, { category: new RegExp(search, "i") }];

    const sortMap = { popular: { createdAt: -1 }, price_low: { price: 1 }, price_high: { price: -1 } };
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(60, Number(limit));

    const [tests, total] = await Promise.all([
      LabTest.find(filter).sort(sortMap[sort] || sortMap.popular).skip((pageNum - 1) * limitNum).limit(limitNum),
      LabTest.countDocuments(filter),
    ]);

    res.json({ tests, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    next(err);
  }
}

async function listCategories(req, res, next) {
  try {
    const categories = await LabTest.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({ categories: categories.map((c) => ({ name: c._id, count: c.count })) });
  } catch (err) {
    next(err);
  }
}

async function getTest(req, res, next) {
  try {
    const test = await LabTest.findOne({ _id: req.params.id, isActive: true });
    if (!test) return res.status(404).json({ message: "Test not found" });
    res.json({ test });
  } catch (err) {
    next(err);
  }
}

// ---- Patient booking ----
async function bookTests(req, res, next) {
  try {
    const { testIds, scheduledDate, timeSlot, collectionAddress, paymentMethod, bookingFor } = req.body;

    const tests = await LabTest.find({ _id: { $in: testIds }, isActive: true });
    if (tests.length === 0) return res.status(400).json({ message: "No valid tests selected" });

    const testLines = tests.map((t) => ({ labTest: t._id, name: t.name, price: t.price }));
    const subtotal = testLines.reduce((s, t) => s + t.price, 0);
    const total = subtotal; // no separate delivery fee for lab collection

    const booking = await LabTestBooking.create({
      bookingNumber: generateLabBookingNumber(),
      patient: req.user.id,
      bookingFor: bookingFor?.type === "dependent"
        ? { type: "dependent", dependentId: bookingFor.dependentId, dependentName: bookingFor.dependentName }
        : { type: "self" },
      tests: testLines,
      scheduledDate,
      timeSlot,
      collectionAddress,
      subtotal,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "cod_pending" : "pending",
      status: "booked",
      statusHistory: [{ status: "booked", note: "Booking placed by patient" }],
    });

    const intent = await createPaymentIntent({ amountRupees: total, receipt: `labbooking_${booking._id}` });
    const payment = await Payment.create({
      user: req.user.id,
      purpose: "lab_booking",
      referenceId: booking._id,
      amount: total,
      method: paymentMethod === "cod" ? "cod" : "razorpay",
      razorpayOrderId: paymentMethod === "cod" ? undefined : intent.razorpayOrderId,
      razorpayPaymentId: paymentMethod === "cod" ? undefined : intent.razorpayPaymentId,
      status: paymentMethod === "cod" ? "cod_pending" : intent.devMode ? "captured" : "created",
    });
    booking.payment = payment._id;
    if (paymentMethod === "online" && intent.devMode) booking.paymentStatus = "paid";
    await booking.save();

    const patientUser = await User.findById(req.user.id);
    await notify({
      user: req.user.id,
      type: "lab_booking_confirmed",
      title: "Lab test booked",
      message: `Your booking ${booking.bookingNumber} is confirmed for ${new Date(scheduledDate).toLocaleDateString()}, ${timeSlot}.`,
      relatedType: "labBooking",
      relatedId: booking._id,
      channels: { email: true },
      email: patientUser?.email,
    });

    res.status(201).json({
      booking,
      devMode: paymentMethod === "cod" ? true : intent.devMode,
      razorpayOrderId: paymentMethod === "cod" ? null : intent.razorpayOrderId,
      razorpayKeyId: paymentMethod === "cod" ? null : intent.razorpayKeyId,
      amount: paymentMethod === "cod" ? total * 100 : intent.amount,
    });
  } catch (err) {
    next(err);
  }
}

async function listMyBookings(req, res, next) {
  try {
    const bookings = await LabTestBooking.find({ patient: req.user.id }).sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
}

async function getBooking(req, res, next) {
  try {
    const booking = await LabTestBooking.findOne({ _id: req.params.id, patient: req.user.id });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json({ booking });
  } catch (err) {
    next(err);
  }
}

module.exports = { listTests, listCategories, getTest, bookTests, listMyBookings, getBooking };
