const mongoose = require("mongoose");

const FOOD_CATEGORIES = [
  "Grains & Cereals", "Protein - Meat & Eggs", "Protein - Plant", "Dairy",
  "Fruits", "Vegetables", "Nuts & Seeds", "Beverages", "Snacks", "Indian Staples",
];

const foodItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    category: { type: String, enum: FOOD_CATEGORIES, required: true },
    servingLabel: { type: String, required: true }, // e.g. "1 roti (40g)", "100g cooked"
    calories: { type: Number, required: true },
    proteinG: { type: Number, default: 0 },
    carbsG: { type: Number, default: 0 },
    fatG: { type: Number, default: 0 },
    fiberG: { type: Number, default: 0 },
    isVeg: { type: Boolean, default: true },
    tags: [{ type: String }], // e.g. "high-protein", "pre-workout"
  },
  { timestamps: true }
);

foodItemSchema.index({ name: "text", tags: "text" });

module.exports = mongoose.model("FoodItem", foodItemSchema);
module.exports.FOOD_CATEGORIES = FOOD_CATEGORIES;
