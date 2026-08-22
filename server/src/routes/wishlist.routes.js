const router = require("express").Router();
const ctrl = require("../controllers/wishlistController");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth, requireRole("patient"));

router.get("/", ctrl.getWishlist);
router.post("/", ctrl.addToWishlist);
router.delete("/:medicineId", ctrl.removeFromWishlist);

module.exports = router;
