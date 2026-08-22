const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    description: { type: String, maxlength: 300 },
    discountType: { type: String, enum: ["flat", "percent"], required: true },
    discountValue: { type: Number, required: true, min: 0 }, // flat: rupees, percent: 0-100
    maxDiscount: { type: Number }, // caps a percent discount, e.g. up to ₹150 off
    minOrderValue: { type: Number, default: 0 },
    usageLimit: { type: Number, default: null }, // null = unlimited
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/** Validates a coupon against a subtotal and returns the discount amount, or throws. */
couponSchema.methods.computeDiscount = function (subtotal) {
  if (!this.isActive) throw Object.assign(new Error("This coupon is no longer active"), { status: 400 });
  if (this.expiresAt && this.expiresAt < new Date()) throw Object.assign(new Error("This coupon has expired"), { status: 400 });
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
    throw Object.assign(new Error("This coupon has reached its usage limit"), { status: 400 });
  }
  if (subtotal < this.minOrderValue) {
    throw Object.assign(new Error(`Add items worth ₹${this.minOrderValue} or more to use this coupon`), { status: 400 });
  }
  let discount = this.discountType === "flat" ? this.discountValue : (subtotal * this.discountValue) / 100;
  if (this.maxDiscount) discount = Math.min(discount, this.maxDiscount);
  return Math.min(Math.round(discount), subtotal);
};

module.exports = mongoose.model("Coupon", couponSchema);
