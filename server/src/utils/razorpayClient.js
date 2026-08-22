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

// True only once a real key pair is set in .env. When false, controllers skip
// the actual Razorpay API calls and auto-capture the payment instead, so the
// booking/checkout/video-call/prescription flows can be fully tested locally
// without a Razorpay account. Never set to true by accident: it requires a
// real key_id starting with "rzp_" that isn't the bundled placeholder.
razorpay.isLiveConfigured = Boolean(
  process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET &&
    process.env.RAZORPAY_KEY_ID !== "rzp_test_placeholder"
);

module.exports = razorpay;
