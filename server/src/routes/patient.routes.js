const router = require("express").Router();
const ctrl = require("../controllers/patientController");
const { requireAuth, requireRole } = require("../middleware/auth");

router.get("/me/profile", requireAuth, requireRole("patient"), ctrl.getMyProfile);
router.patch("/me/profile", requireAuth, requireRole("patient"), ctrl.updateMyProfile);

module.exports = router;
