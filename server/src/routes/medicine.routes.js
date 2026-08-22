const router = require("express").Router();
const ctrl = require("../controllers/medicineController");

router.get("/", ctrl.listStore);
router.get("/categories", ctrl.listCategories);
router.get("/:id", ctrl.getMedicine);

module.exports = router;
