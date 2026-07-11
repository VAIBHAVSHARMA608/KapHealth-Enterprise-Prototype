const router = require("express").Router();
const ctrl = require("../controllers/faqController");

router.get("/", ctrl.listFaqs);

module.exports = router;
