const router = require("express").Router();
const ctrl = require("../controllers/patientController");
const { requireAuth, requireRole } = require("../middleware/auth");

router.get("/me/profile", requireAuth, requireRole("patient"), ctrl.getMyProfile);
router.patch("/me/profile", requireAuth, requireRole("patient"), ctrl.updateMyProfile);

// Phase 3: dependents (family members)
router.post("/me/dependents", requireAuth, requireRole("patient"), ctrl.addDependent);
router.patch("/me/dependents/:dependentId", requireAuth, requireRole("patient"), ctrl.updateDependent);
router.delete("/me/dependents/:dependentId", requireAuth, requireRole("patient"), ctrl.removeDependent);

module.exports = router;
