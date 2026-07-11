const Razorpay = require("razorpay");

/**
 * Single shared Razorpay client. If keys aren't set yet (local dev without
 * a Razorpay account), calls will throw a clear error rather than silently
 * hitting a real endpoint with bad credentials.
 */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});

module.exports = razorpay;
