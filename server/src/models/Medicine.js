const mongoose = require("mongoose");

/** Catalog item in the pharmacy inventory used to price/fulfil orders. */
const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    genericName: { type: String },
    manufacturer: { type: String },
    unit: { type: String, default: "strip" }, // strip / bottle / tube
    mrp: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    requiresPrescription: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 0 },
    imageUrl: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medicine", medicineSchema);
