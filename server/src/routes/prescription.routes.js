const router = require("express").Router();
const ctrl = require("../controllers/prescriptionController");
const { requireAuth, requireRole } = require("../middleware/auth");
const { validateBody } = require("../validators/validate");
const { prescriptionSchema } = require("../validators/appointmentValidators");

router.post(
  "/appointment/:appointmentId",
  requireAuth,
  requireRole("doctor"),
  validateBody(prescriptionSchema),
  ctrl.createPrescription
);
router.get("/", requireAuth, ctrl.listMyPrescriptions);
router.get("/:id", requireAuth, ctrl.getPrescription);

module.exports = router;
