const Order = require("../models/Order");
const Medicine = require("../models/Medicine");
const Prescription = require("../models/Prescription");
const Payment = require("../models/Payment");
const Coupon = require("../models/Coupon");
const User = require("../models/User");
const { createPaymentIntent } = require("../utils/paymentFlow");
const { notify } = require("../utils/notify");
const { generateOrderNumber } = require("../utils/orderNumber");
const { getOrCreateCart, priceCart } = require("./cartController");

function generateDeliveryOtp() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

const DELIVERY_FEE_BELOW_THRESHOLD = 49;
const FREE_DELIVERY_THRESHOLD = 499;

/** Patient clicks "Order" on a prescription -> places a medicine order (COD or online). */
async function placeOrder(req, res, next) {
  try {
    const { prescriptionId, items, deliveryAddress, paymentMethod } = req.body;

    const prescription = await Prescription.findOne({ _id: prescriptionId, patient: req.user.id });
    if (!prescription) return res.status(404).json({ message: "Prescription not found" });

    const medicineIds = items.map((i) => i.medicineId);
    const medicines = await Medicine.find({ _id: { $in: medicineIds }, isActive: true });
    const medicineMap = new Map(medicines.map((m) => [m._id.toString(), m]));

    const orderItems = items.map((i) => {
      const med = medicineMap.get(i.medicineId);
      if (!med) throw Object.assign(new Error(`Medicine not found: ${i.medicineId}`), { status: 400 });
      return { medicine: med._id, name: med.name, quantity: i.quantity, unitPrice: med.sellingPrice };
    });

    const subtotal = orderItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE_BELOW_THRESHOLD;
    const total = subtotal + deliveryFee;

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      patient: req.user.id,
      prescription: prescription._id,
      items: orderItems,
      deliveryAddress,
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "cod_pending" : "pending",
      deliveryOtp: generateDeliveryOtp(),
      status: "placed",
      statusHistory: [{ status: "placed", note: "Order placed by patient" }],
    });

    prescription.isOrdered = true;
    await prescription.save();

    const patientUser = await User.findById(req.user.id);
    await notify({
      user: req.user.id,
      type: "order_placed",
      title: "Order placed",
      message: `Your order ${order.orderNumber} for ₹${total} has been placed.`,
      relatedType: "order",
      relatedId: order._id,
      channels: { email: true },
      email: patientUser?.email,
    });

    if (paymentMethod === "cod") {
      const payment = await Payment.create({
        user: req.user.id,
        purpose: "order",
        referenceId: order._id,
        amount: total,
        method: "cod",
        status: "cod_pending",
      });
      order.payment = payment._id;
      await order.save();
      return res.status(201).json({ order });
    }

    // online payment via Razorpay (or dev-mode auto-capture)
    const intent = await createPaymentIntent({ amountRupees: total, receipt: `order_${order._id}` });
    const payment = await Payment.create({
      user: req.user.id,
      purpose: "order",
      referenceId: order._id,
      amount: total,
      method: "razorpay",
      razorpayOrderId: intent.razorpayOrderId,
      razorpayPaymentId: intent.razorpayPaymentId,
      status: intent.devMode ? "captured" : "created",
    });
    order.payment = payment._id;
    if (intent.devMode) {
      order.paymentStatus = "paid";
      order.status = "confirmed";
      order.statusHistory.push({ status: "confirmed", note: "Payment auto-captured (dev mode)" });
    }
    await order.save();

    res.status(201).json({
      order,
      devMode: intent.devMode,
      razorpayOrderId: intent.razorpayOrderId,
      razorpayKeyId: intent.razorpayKeyId,
      amount: intent.amount,
    });
  } catch (err) {
    next(err);
  }
}

/** Phase 2: patient checks out their OTC cart (essentials, no prescription needed). */
async function checkoutCart(req, res, next) {
  try {
    const { deliveryAddress, paymentMethod } = req.body;

    const cart = await getOrCreateCart(req.user.id);
    if (cart.items.length === 0) return res.status(400).json({ message: "Your cart is empty" });

    const priced = await priceCart(cart);
    if (cart.couponCode && priced.couponError) {
      return res.status(400).json({ message: priced.couponError });
    }

    // Safety net: reject if anything in the cart somehow requires a prescription.
    if (priced.items.some((i) => i.medicine.requiresPrescription)) {
      return res.status(400).json({ message: "One of these items needs a prescription and can't be bought directly." });
    }

    const orderItems = priced.items.map((i) => ({
      medicine: i.medicine._id,
      name: i.medicine.name,
      quantity: i.quantity,
      unitPrice: i.medicine.sellingPrice,
    }));

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      patient: req.user.id,
      orderSource: "store",
      items: orderItems,
      deliveryAddress,
      subtotal: priced.subtotal,
      deliveryFee: priced.deliveryFee,
      discount: priced.discount,
      couponCode: priced.couponCode || undefined,
      total: priced.total,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "cod_pending" : "pending",
      deliveryOtp: generateDeliveryOtp(),
      status: "placed",
      statusHistory: [{ status: "placed", note: "Store order placed by patient" }],
    });

    if (priced.couponCode) {
      await Coupon.updateOne({ code: priced.couponCode.toUpperCase() }, { $inc: { usedCount: 1 } });
    }

    const patientUser = await User.findById(req.user.id);
    await notify({
      user: req.user.id,
      type: "order_placed",
      title: "Order placed",
      message: `Your order ${order.orderNumber} for ₹${priced.total} has been placed.`,
      relatedType: "order",
      relatedId: order._id,
      channels: { email: true },
      email: patientUser?.email,
    });

    // Clear the cart now that the order is placed.
    cart.items = [];
    cart.couponCode = null;
    await cart.save();

    if (paymentMethod === "cod") {
      const payment = await Payment.create({
        user: req.user.id,
        purpose: "order",
        referenceId: order._id,
        amount: priced.total,
        method: "cod",
        status: "cod_pending",
      });
      order.payment = payment._id;
      await order.save();
      return res.status(201).json({ order });
    }

    const intent = await createPaymentIntent({ amountRupees: priced.total, receipt: `order_${order._id}` });
    const payment = await Payment.create({
      user: req.user.id,
      purpose: "order",
      referenceId: order._id,
      amount: priced.total,
      method: "razorpay",
      razorpayOrderId: intent.razorpayOrderId,
      razorpayPaymentId: intent.razorpayPaymentId,
      status: intent.devMode ? "captured" : "created",
    });
    order.payment = payment._id;
    if (intent.devMode) {
      order.paymentStatus = "paid";
      order.status = "confirmed";
      order.statusHistory.push({ status: "confirmed", note: "Payment auto-captured (dev mode)" });
    }
    await order.save();

    res.status(201).json({
      order,
      devMode: intent.devMode,
      razorpayOrderId: intent.razorpayOrderId,
      razorpayKeyId: intent.razorpayKeyId,
      amount: intent.amount,
    });
  } catch (err) {
    next(err);
  }
}

async function listMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ patient: req.user.id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
}

/** Tracking timeline for a single order ("tracks his medicines"). */
async function getOrder(req, res, next) {
  try {
    const order = await Order.findOne({ _id: req.params.id, patient: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ order });
  } catch (err) {
    next(err);
  }
}

async function listMedicineCatalog(req, res, next) {
  try {
    const { search } = req.query;
    const filter = { isActive: true };
    if (search) filter.name = new RegExp(search, "i");
    const medicines = await Medicine.find(filter).limit(50);
    res.json({ medicines });
  } catch (err) {
    next(err);
  }
}

module.exports = { placeOrder, checkoutCart, listMyOrders, getOrder, listMedicineCatalog };
