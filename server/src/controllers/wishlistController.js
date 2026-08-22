const Wishlist = require("../models/Wishlist");
const Medicine = require("../models/Medicine");

async function getOrCreate(patientId) {
  let wishlist = await Wishlist.findOne({ patient: patientId });
  if (!wishlist) wishlist = await Wishlist.create({ patient: patientId, medicines: [] });
  return wishlist;
}

async function getWishlist(req, res, next) {
  try {
    const wishlist = await getOrCreate(req.user.id);
    const medicines = await Medicine.find({ _id: { $in: wishlist.medicines }, isActive: true });
    res.json({ medicines });
  } catch (err) {
    next(err);
  }
}

async function addToWishlist(req, res, next) {
  try {
    const { medicineId } = req.body;
    const medicine = await Medicine.findOne({ _id: medicineId, isActive: true });
    if (!medicine) return res.status(404).json({ message: "Item not found" });

    const wishlist = await getOrCreate(req.user.id);
    if (!wishlist.medicines.some((id) => id.toString() === medicineId)) {
      wishlist.medicines.push(medicineId);
      await wishlist.save();
    }
    res.json({ medicineIds: wishlist.medicines });
  } catch (err) {
    next(err);
  }
}

async function removeFromWishlist(req, res, next) {
  try {
    const wishlist = await getOrCreate(req.user.id);
    wishlist.medicines = wishlist.medicines.filter((id) => id.toString() !== req.params.medicineId);
    await wishlist.save();
    res.json({ medicineIds: wishlist.medicines });
  } catch (err) {
    next(err);
  }
}

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
