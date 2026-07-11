const router = require("express").Router();
const ctrl = require("../controllers/authController");
const { validateBody } = require("../validators/validate");
const { requestOtpSchema, verifyOtpSchema, googleAuthSchema, adminLoginSchema } = require("../validators/authValidators");
const { requireAuth } = require("../middleware/auth");
const { otpLimiter, adminLoginLimiter } = require("../middleware/rateLimiters");

router.post("/otp/request", otpLimiter, validateBody(requestOtpSchema), ctrl.requestOtp);
router.post("/otp/verify", validateBody(verifyOtpSchema), ctrl.verifyOtp);
router.post("/google", validateBody(googleAuthSchema), ctrl.googleLogin);
router.post("/refresh", ctrl.refresh);
router.post("/logout", ctrl.logout);
router.get("/me", requireAuth, ctrl.me);

// Admin credential login lives here too (still gated by ADMIN_ACCESS_KEY at the /api/admin layer for everything after login)
router.post("/admin-login", adminLoginLimiter, validateBody(adminLoginSchema), ctrl.adminLogin);

module.exports = router;
