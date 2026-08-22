const Medicine = require("../models/Medicine");

/**
 * Public OTC store catalog: search + category + price filters + sort + pagination.
 * Used by the Store page. Prescription-only items are shown too (badged), but
 * they can't be added to the no-prescription cart -- enforced in cartController.
 */
async function listStore(req, res, next) {
  try {
    const {
      search,
      category,
      otcOnly,
      minPrice,
      maxPrice,
      sort = "popular",
      page = 1,
      limit = 24,
    } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (otcOnly === "true") filter.requiresPrescription = false;
    if (minPrice || maxPrice) {
      filter.sellingPrice = {};
      if (minPrice) filter.sellingPrice.$gte = Number(minPrice);
      if (maxPrice) filter.sellingPrice.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { genericName: new RegExp(search, "i") },
        { tags: new RegExp(search, "i") },
      ];
    }

    const sortMap = {
      popular: { ratingCount: -1, createdAt: -1 },
      price_low: { sellingPrice: 1 },
      price_high: { sellingPrice: -1 },
      rating: { ratingAverage: -1 },
      newest: { createdAt: -1 },
    };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(60, Number(limit));

    const [medicines, total] = await Promise.all([
      Medicine.find(filter)
        .sort(sortMap[sort] || sortMap.popular)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Medicine.countDocuments(filter),
    ]);

    res.json({ medicines, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    next(err);
  }
}

async function listCategories(req, res, next) {
  try {
    const categories = await Medicine.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({ categories: categories.map((c) => ({ name: c._id, count: c.count })) });
  } catch (err) {
    next(err);
  }
}

async function getMedicine(req, res, next) {
  try {
    const medicine = await Medicine.findOne({ _id: req.params.id, isActive: true });
    if (!medicine) return res.status(404).json({ message: "Item not found" });
    res.json({ medicine });
  } catch (err) {
    next(err);
  }
}

module.exports = { listStore, listCategories, getMedicine };
