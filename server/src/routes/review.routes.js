const router = require("express").Router();
const ctrl = require("../controllers/reviewController");
const { requireAuth, requireRole } = require("../middleware/auth");

router.post("/", requireAuth, requireRole("patient"), ctrl.createReview);
router.get("/doctor/:doctorId", ctrl.listDoctorReviews);

module.exports = router;
