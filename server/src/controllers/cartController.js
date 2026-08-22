const Cart = require("../models/Cart");
const Medicine = require("../models/Medicine");
const Coupon = require("../models/Coupon");

const FREE_DELIVERY_THRESHOLD = 499;
const DELIVERY_FEE_BELOW_THRESHOLD = 49;

async function getOrCreateCart(patientId) {
  let cart = await Cart.findOne({ patient: patientId });
  if (!cart) cart = await Cart.create({ patient: patientId, items: [] });
  return cart;
}

/** Builds the priced view of a cart (items with live medicine data + totals). */
async function priceCart(cart) {
  const medicineIds = cart.items.map((i) => i.medicine);
  const medicines = await Medicine.find({ _id: { $in: medicineIds }, isActive: true });
  const medMap = new Map(medicines.map((m) => [m._id.toString(), m]));

  const items = cart.items
    .map((i) => {
      const med = medMap.get(i.medicine.toString());
      if (!med) return null;
      return {
        medicine: med,
        quantity: i.quantity,
        lineTotal: med.sellingPrice * i.quantity,
      };
    })
    .filter(Boolean);

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);

  let discount = 0;
  let couponError = null;
  if (cart.couponCode) {
    try {
      const coupon = await Coupon.findOne({ code: cart.couponCode.toUpperCase() });
      if (!coupon) throw Object.assign(new Error("Coupon not found"), { status: 400 });
      discount = coupon.computeDiscount(subtotal);
    } catch (err) {
      couponError = err.message;
      discount = 0;
    }
  }

  const deliveryFee = subtotal === 0 || subtotal - discount >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE_BELOW_THRESHOLD;
  const total = Math.max(0, subtotal - discount) + deliveryFee;

  return { items, subtotal, discount, deliveryFee, total, couponCode: cart.couponCode, couponError };
}

async function getCart(req, res, next) {
  try {
    const cart = await getOrCreateCart(req.user.id);
    res.json({ cart: await priceCart(cart) });
  } catch (err) {
    next(err);
  }
}

/** Adds an OTC (non-prescription) item to the cart. Rx items are rejected -- they go through the prescription order flow. */
async function addItem(req, res, next) {
  try {
    const { medicineId, quantity = 1 } = req.body;
    const medicine = await Medicine.findOne({ _id: medicineId, isActive: true });
    if (!medicine) return res.status(404).json({ message: "Item not found" });
    if (medicine.requiresPrescription) {
      return res.status(400).json({ message: "This item needs a doctor's prescription -- order it from your prescription instead." });
    }

    const cart = await getOrCreateCart(req.user.id);
    const existing = cart.items.find((i) => i.medicine.toString() === medicineId);
    if (existing) existing.quantity += Number(quantity);
    else cart.items.push({ medicine: medicineId, quantity: Number(quantity) });
    await cart.save();

    res.json({ cart: await priceCart(cart) });
  } catch (err) {
    next(err);
  }
}

async function updateItem(req, res, next) {
  try {
    const { quantity } = req.body;
    const cart = await getOrCreateCart(req.user.id);
    const item = cart.items.find((i) => i.medicine.toString() === req.params.medicineId);
    if (!item) return res.status(404).json({ message: "Item not in cart" });

    if (Number(quantity) <= 0) {
      cart.items = cart.items.filter((i) => i.medicine.toString() !== req.params.medicineId);
    } else {
      item.quantity = Number(quantity);
    }
    await cart.save();
    res.json({ cart: await priceCart(cart) });
  } catch (err) {
    next(err);
  }
}

async function removeItem(req, res, next) {
  try {
    const cart = await getOrCreateCart(req.user.id);
    cart.items = cart.items.filter((i) => i.medicine.toString() !== req.params.medicineId);
    await cart.save();
    res.json({ cart: await priceCart(cart) });
  } catch (err) {
    next(err);
  }
}

async function applyCoupon(req, res, next) {
  try {
    const { code } = req.body;
    const cart = await getOrCreateCart(req.user.id);
    cart.couponCode = code ? code.toUpperCase() : null;
    await cart.save();
    const priced = await priceCart(cart);
    if (code && priced.couponError) return res.status(400).json({ message: priced.couponError });
    res.json({ cart: priced });
  } catch (err) {
    next(err);
  }
}

async function clearCart(req, res, next) {
  try {
    const cart = await getOrCreateCart(req.user.id);
    cart.items = [];
    cart.couponCode = null;
    await cart.save();
    res.json({ cart: await priceCart(cart) });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCart, addItem, updateItem, removeItem, applyCoupon, clearCart, getOrCreateCart, priceCart };
