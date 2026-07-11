const router = require("express").Router();
const ctrl = require("../controllers/appointmentController");
const { requireAuth, requireRole } = require("../middleware/auth");
const { validateBody } = require("../validators/validate");
const { bookAppointmentSchema } = require("../validators/appointmentValidators");

router.post("/", requireAuth, requireRole("patient"), validateBody(bookAppointmentSchema), ctrl.bookAppointment);
router.get("/", requireAuth, ctrl.listMyAppointments);
router.get("/:id", requireAuth, ctrl.getAppointment);
router.get("/:id/room-access", requireAuth, ctrl.getRoomAccess);
router.post("/:id/end-call", requireAuth, ctrl.endCall);
router.post("/:id/cancel", requireAuth, ctrl.cancelAppointment);

module.exports = router;
