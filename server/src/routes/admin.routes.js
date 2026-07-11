const router = require("express").Router();
const ctrl = require("../controllers/adminController");
const { requireAuth, requireRole } = require("../middleware/auth");
const { requireAdminKey } = require("../middleware/adminGate");

// Every route here is behind: valid JWT -> role==="admin" -> secret x-admin-key header.
router.use(requireAuth, requireRole("admin"), requireAdminKey);

router.get("/dashboard", ctrl.getDashboardStats);

router.get("/doctors", ctrl.listDoctorApplications);
router.patch("/doctors/:id/review", ctrl.reviewDoctorApplication);

router.get("/orders", ctrl.listAllOrders);
router.patch("/orders/:id/status", ctrl.updateOrderStatus);

router.get("/complaints", ctrl.listAllComplaints);
router.patch("/complaints/:id/respond", ctrl.respondToComplaint);

router.post("/faqs", ctrl.createFaq);
router.patch("/faqs/:id", ctrl.updateFaq);
router.delete("/faqs/:id", ctrl.deleteFaq);

router.get("/reviews", ctrl.listAllReviews);
router.patch("/reviews/:id/toggle-visibility", ctrl.toggleReviewVisibility);

router.get("/appointments", ctrl.listAllAppointments);

module.exports = router;
