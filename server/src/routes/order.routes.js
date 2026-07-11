const router = require("express").Router();
const ctrl = require("../controllers/orderController");
const { requireAuth, requireRole } = require("../middleware/auth");
const { validateBody } = require("../validators/validate");
const { placeOrderSchema } = require("../validators/orderValidators");

router.get("/medicines", ctrl.listMedicineCatalog);
router.post("/", requireAuth, requireRole("patient"), validateBody(placeOrderSchema), ctrl.placeOrder);
router.get("/", requireAuth, requireRole("patient"), ctrl.listMyOrders);
router.get("/:id", requireAuth, requireRole("patient"), ctrl.getOrder);

module.exports = router;
