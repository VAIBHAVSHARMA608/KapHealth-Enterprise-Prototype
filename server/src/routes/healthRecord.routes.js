const router = require("express").Router();
const ctrl = require("../controllers/healthRecordController");
const { requireAuth, requireRole } = require("../middleware/auth");
const uploadHealthRecord = require("../middleware/uploadHealthRecord");

router.use(requireAuth, requireRole("patient"));

router.get("/", ctrl.listMyRecords);
router.post("/", uploadHealthRecord.single("file"), ctrl.uploadRecord);
router.delete("/:id", ctrl.deleteRecord);

module.exports = router;
