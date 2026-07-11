const Order = require("../models/Order");
const Medicine = require("../models/Medicine");
const Prescription = require("../models/Prescription");
const Payment = require("../models/Payment");
const razorpay = require("../utils/razorpayClient");
const { generateOrderNumber } = require("../utils/orderNumber");

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
      status: "placed",
      statusHistory: [{ status: "placed", note: "Order placed by patient" }],
    });

    prescription.isOrdered = true;
    await prescription.save();

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

    // online payment via Razorpay
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: `order_${order._id}`,
    });
    const payment = await Payment.create({
      user: req.user.id,
      purpose: "order",
      referenceId: order._id,
      amount: total,
      method: "razorpay",
      razorpayOrderId: rzpOrder.id,
      status: "created",
    });
    order.payment = payment._id;
    await order.save();

    res.status(201).json({
      order,
      razorpayOrderId: rzpOrder.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      amount: rzpOrder.amount,
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

module.exports = { placeOrder, listMyOrders, getOrder, listMedicineCatalog };
