const Faq = require("../models/Faq");

/** Public-ish FAQ list, filtered by audience (patient/doctor/both). */
async function listFaqs(req, res, next) {
  try {
    const { audience } = req.query; // "patient" | "doctor"
    const filter = { isPublished: true };
    if (audience) filter.audience = { $in: [audience, "both"] };
    const faqs = await Faq.find(filter).sort({ category: 1, order: 1 });
    res.json({ faqs });
  } catch (err) {
    next(err);
  }
}

module.exports = { listFaqs };
