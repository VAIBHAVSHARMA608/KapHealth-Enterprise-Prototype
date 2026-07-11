const router = require("express").Router();
const ctrl = require("../controllers/paymentController");
const { requireAuth } = require("../middleware/auth");

router.post("/verify", requireAuth, ctrl.verifyPayment);

module.exports = router;
