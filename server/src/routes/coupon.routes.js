const router = require("express").Router();
const ctrl = require("../controllers/couponController");
const { requireAuth, requireRole } = require("../middleware/auth");

router.post("/check", requireAuth, requireRole("patient"), ctrl.checkCoupon);

module.exports = router;
