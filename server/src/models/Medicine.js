const mongoose = require("mongoose");

const MEDICINE_CATEGORIES = [
  "Pain Relief",
  "Fever & Cold",
  "Digestive Care",
  "Diabetes Care",
  "Cardiac Care",
  "Vitamins & Supplements",
  "First Aid",
  "Baby Care",
  "Personal Care",
  "Skin Care",
  "Devices & Essentials",
  "Sexual Wellness",
  "Ayurveda & Herbal",
];

/** Catalog item in the pharmacy inventory used to price/fulfil orders and power the OTC store. */
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

    // ---- OTC store fields ----
    category: { type: String, enum: MEDICINE_CATEGORIES, default: "Devices & Essentials", index: true },
    description: { type: String, maxlength: 1000 },
    tags: [{ type: String, index: true }],
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

medicineSchema.index({ category: 1, isActive: 1 });
medicineSchema.index({ name: "text", genericName: "text", tags: "text" });

module.exports = mongoose.model("Medicine", medicineSchema);
module.exports.MEDICINE_CATEGORIES = MEDICINE_CATEGORIES;
