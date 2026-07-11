const crypto = require("crypto");
const Payment = require("../models/Payment");
const Appointment = require("../models/Appointment");
const Order = require("../models/Order");

/**
 * Verifies the Razorpay checkout signature (HMAC SHA256 of orderId|paymentId
 * using your key secret) and marks the underlying Appointment/Order paid.
 * This is the standard Razorpay client-side-checkout verification flow:
 * https://razorpay.com/docs/payments/server-integration/nodejs/payment-gateway/build-integration/#3-verify-payment-signature
 */
async function verifyPayment(req, res, next) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) return res.status(404).json({ message: "Payment record not found" });

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "placeholder_secret")
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      payment.status = "failed";
      payment.failureReason = "Signature mismatch";
      await payment.save();
      return res.status(400).json({ message: "Payment verification failed" });
    }

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = "captured";
    await payment.save();

    if (payment.purpose === "appointment") {
      await Appointment.findByIdAndUpdate(payment.referenceId, {
        paymentStatus: "paid",
        status: "confirmed",
      });
    } else if (payment.purpose === "order") {
      const order = await Order.findById(payment.referenceId);
      order.paymentStatus = "paid";
      order.status = "confirmed";
      order.statusHistory.push({ status: "confirmed", note: "Payment received" });
      await order.save();
    }

    res.json({ message: "Payment verified", status: "captured" });
  } catch (err) {
    next(err);
  }
}

module.exports = { verifyPayment };
