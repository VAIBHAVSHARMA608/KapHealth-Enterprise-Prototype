const router = require("express").Router();
const ctrl = require("../controllers/notificationController");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth);

router.get("/", ctrl.listMyNotifications);
router.patch("/:id/read", ctrl.markRead);
router.patch("/read-all", ctrl.markAllRead);

module.exports = router;
