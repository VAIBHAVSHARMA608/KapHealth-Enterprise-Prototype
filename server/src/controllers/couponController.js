const Coupon = require("../models/Coupon");

/** Public: check a coupon against a subtotal without applying it (used for inline validation). */
async function checkCoupon(req, res, next) {
  try {
    const { code, subtotal } = req.body;
    const coupon = await Coupon.findOne({ code: (code || "").toUpperCase() });
    if (!coupon) return res.status(404).json({ message: "Invalid coupon code" });
    const discount = coupon.computeDiscount(Number(subtotal) || 0);
    res.json({ valid: true, discount, description: coupon.description });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ valid: false, message: err.message });
    next(err);
  }
}

// ---- Admin CRUD ----
async function listCoupons(req, res, next) {
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

module.exports = { checkCoupon, listCoupons, createCoupon, updateCoupon, deleteCoupon };
