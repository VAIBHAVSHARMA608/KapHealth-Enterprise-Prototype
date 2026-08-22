const router = require("express").Router();
const ctrl = require("../controllers/cartController");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth, requireRole("patient"));

router.get("/", ctrl.getCart);
router.post("/items", ctrl.addItem);
router.patch("/items/:medicineId", ctrl.updateItem);
router.delete("/items/:medicineId", ctrl.removeItem);
router.post("/coupon", ctrl.applyCoupon);
router.delete("/", ctrl.clearCart);

module.exports = router;
