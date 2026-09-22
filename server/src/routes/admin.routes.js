const router = require("express").Router();
const ctrl = require("../controllers/adminController");
const { requireAuth, requireRole } = require("../middleware/auth");
const { requireAdminKey } = require("../middleware/adminGate");

// Every route here is behind: valid JWT -> role==="admin" -> secret x-admin-key header.
router.use(requireAuth, requireRole("admin"), requireAdminKey);

// Keep the protected admin root useful for clients that probe the namespace
// before loading a specific console section.
router.get("/", ctrl.getDashboardStats);
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

// ---- OTC store: medicine catalog ----
router.get("/medicines", ctrl.listAllMedicines);
router.post("/medicines", ctrl.createMedicine);
router.patch("/medicines/:id", ctrl.updateMedicine);
router.delete("/medicines/:id", ctrl.deleteMedicine);

// ---- OTC store: coupons ----
router.get("/coupons", ctrl.listAllCoupons);
router.post("/coupons", ctrl.createCoupon);
router.patch("/coupons/:id", ctrl.updateCoupon);
router.delete("/coupons/:id", ctrl.deleteCoupon);

// ---- Phase 3: lab test catalog ----
router.get("/lab-tests", ctrl.listAllLabTests);
router.post("/lab-tests", ctrl.createLabTest);
router.patch("/lab-tests/:id", ctrl.updateLabTest);
router.delete("/lab-tests/:id", ctrl.deleteLabTest);

// ---- Phase 3: lab bookings ----
router.get("/lab-bookings", ctrl.listAllLabBookings);
router.patch("/lab-bookings/:id/status", ctrl.updateLabBookingStatus);

// ---- Phase 3: doctor payouts ----
router.get("/payouts", ctrl.listPayouts);
router.post("/payouts", ctrl.generatePayout);
router.patch("/payouts/:id", ctrl.updatePayoutStatus);

// ---- Phase 3: analytics dashboard ----
router.get("/analytics", ctrl.getAnalytics);

// ---- Phase 5: workout template catalog ----
router.get("/workout-templates", ctrl.listAllWorkoutTemplates);
router.post("/workout-templates", ctrl.createWorkoutTemplate);
router.patch("/workout-templates/:id", ctrl.updateWorkoutTemplate);
router.delete("/workout-templates/:id", ctrl.deleteWorkoutTemplate);

// ---- Phase 5: food catalog ----
router.get("/foods", ctrl.listAllFoods);
router.post("/foods", ctrl.createFood);
router.patch("/foods/:id", ctrl.updateFood);
router.delete("/foods/:id", ctrl.deleteFood);

// ---- Phase 5: wellness tips ----
router.get("/wellness-tips", ctrl.listAllWellnessTips);
router.post("/wellness-tips", ctrl.createWellnessTip);
router.patch("/wellness-tips/:id", ctrl.updateWellnessTip);
router.delete("/wellness-tips/:id", ctrl.deleteWellnessTip);

module.exports = router;
