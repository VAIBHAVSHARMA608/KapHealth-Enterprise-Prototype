const mongoose = require("mongoose");

const dietPlanSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    forDependentId: { type: mongoose.Schema.Types.ObjectId, default: null },
    forDependentName: { type: String, default: null },

    goal: {
      type: String,
      enum: ["weight_loss", "mild_weight_loss", "maintenance", "mild_weight_gain", "muscle_gain"],
      required: true,
    },
    basedOnWeightKg: { type: Number, required: true },
    basedOnTdee: { type: Number, required: true },

    calorieTarget: { type: Number, required: true },
    macros: {
      proteinG: { type: Number, required: true },
      carbsG: { type: Number, required: true },
      fatG: { type: Number, required: true },
    },

    // A sample day's meal structure suggested at generation time (editable).
    sampleMeals: [
      {
        mealType: { type: String, enum: ["breakfast", "lunch", "dinner", "snack"], required: true },
        items: [
          {
            foodItem: { type: mongoose.Schema.Types.ObjectId, ref: "FoodItem" },
            name: String,
            servingLabel: String,
            calories: Number,
            proteinG: Number,
            carbsG: Number,
            fatG: Number,
          },
        ],
      },
    ],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/** A single day's logged food entries -- the "calorie counter" feature. */
const mealLogEntrySchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    forDependentId: { type: mongoose.Schema.Types.ObjectId, default: null },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD, simplifies daily grouping
    mealType: { type: String, enum: ["breakfast", "lunch", "dinner", "snack"], required: true },
    foodItem: { type: mongoose.Schema.Types.ObjectId, ref: "FoodItem" },
    name: { type: String, required: true },
    servings: { type: Number, default: 1 },
    calories: { type: Number, required: true },
    proteinG: { type: Number, default: 0 },
    carbsG: { type: Number, default: 0 },
    fatG: { type: Number, default: 0 },
  },
  { timestamps: true }
);

mealLogEntrySchema.index({ patient: 1, date: 1 });

const DietPlan = mongoose.model("DietPlan", dietPlanSchema);
const MealLogEntry = mongoose.model("MealLogEntry", mealLogEntrySchema);

module.exports = { DietPlan, MealLogEntry };
