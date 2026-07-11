const router = require("express").Router();
const ctrl = require("../controllers/complaintController");
const { requireAuth } = require("../middleware/auth");

router.post("/", requireAuth, ctrl.createComplaint);
router.get("/", requireAuth, ctrl.listMyComplaints);
router.get("/:id", requireAuth, ctrl.getMyComplaint);

module.exports = router;
