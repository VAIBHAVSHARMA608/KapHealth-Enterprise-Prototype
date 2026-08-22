const razorpay = require("./razorpayClient");

/**
 * Creates a Razorpay order when real credentials are configured in .env.
 * Otherwise (the default, out-of-the-box local setup) it returns a dev-mode
 * marker so the caller can auto-capture the payment immediately, with no
 * real gateway involved. This is what lets booking/checkout/video-call/
 * e-prescription be fully tested end-to-end without a Razorpay account.
 *
 * Set real RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET in .env to switch this off
 * and go through the real Razorpay checkout widget instead.
 */
async function createPaymentIntent({ amountRupees, receipt }) {
  if (razorpay.isLiveConfigured) {
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(amountRupees * 100),
      currency: "INR",
      receipt,
    });
    return {
      devMode: false,
      razorpayOrderId: rzpOrder.id,
      razorpayPaymentId: undefined,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      amount: rzpOrder.amount,
    };
  }

  return {
    devMode: true,
    razorpayOrderId: `dev_${receipt}_${Date.now()}`,
    razorpayPaymentId: `dev_payment_${Date.now()}`,
    razorpayKeyId: null,
    amount: Math.round(amountRupees * 100),
  };
}

module.exports = { createPaymentIntent };
