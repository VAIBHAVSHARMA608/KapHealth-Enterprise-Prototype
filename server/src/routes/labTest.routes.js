const router = require("express").Router();
const ctrl = require("../controllers/labTestController");
const { requireAuth, requireRole } = require("../middleware/auth");

// Public catalog
router.get("/", ctrl.listTests);
router.get("/categories", ctrl.listCategories);

// Patient bookings (before /:id so "bookings" isn't swallowed by the param route)
router.get("/bookings/mine", requireAuth, requireRole("patient"), ctrl.listMyBookings);
router.get("/bookings/:id", requireAuth, requireRole("patient"), ctrl.getBooking);
router.post("/bookings", requireAuth, requireRole("patient"), ctrl.bookTests);

router.get("/:id", ctrl.getTest);

module.exports = router;
