const router = require("express").Router();
const ctrl = require("../controllers/wellnessController");
const { requireAuth, requireRole } = require("../middleware/auth");
const uploadWellnessPhoto = require("../middleware/uploadWellnessPhoto");

// ---- Calculators (stateless, no login needed) ----
router.post("/calculate", ctrl.calculateVitals);

// ---- Public catalog reads ----
router.get("/foods", ctrl.searchFoods);
router.get("/workout-templates", ctrl.listWorkoutTemplates);
router.get("/workout-templates/sports", ctrl.listSports);
router.get("/workout-templates/:id", ctrl.getWorkoutTemplate);
router.get("/tips", ctrl.listTips);

// ---- Everything below requires a logged-in patient ----
router.use(requireAuth, requireRole("patient"));

// Body metrics
router.post("/body-metrics", ctrl.saveBodyMetric);
router.get("/body-metrics", ctrl.listMyBodyMetrics);
router.delete("/body-metrics/:id", ctrl.deleteBodyMetric);

// Diet planner
router.post("/diet-plans/generate", ctrl.generateDietPlan);
router.get("/diet-plans", ctrl.listMyDietPlans);
router.get("/diet-plans/active", ctrl.getActiveDietPlan);

// Meal log / calorie counter
router.post("/meal-log", ctrl.logMeal);
router.get("/meal-log/:date", ctrl.getMealLogForDate);
router.delete("/meal-log/:id", ctrl.deleteMealLogEntry);

// Workout plans (patient's adopted plan)
router.post("/workout-templates/:id/adopt", ctrl.adoptWorkoutTemplate);
router.get("/workout-plans/active", ctrl.getMyActiveWorkoutPlan);
router.get("/workout-plans", ctrl.listMyWorkoutPlans);
router.post("/workout-plans/:id/complete-session", ctrl.completeWorkoutSession);

// AI reviewer
router.post("/ai-review", uploadWellnessPhoto.array("photos", 3), ctrl.submitAiReview);
router.get("/ai-review", ctrl.listMyAiReviews);

module.exports = router;
