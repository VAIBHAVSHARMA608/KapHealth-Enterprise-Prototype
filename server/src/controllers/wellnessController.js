const BodyMetric = require("../models/BodyMetric");
const { DietPlan, MealLogEntry } = require("../models/DietPlan");
const FoodItem = require("../models/FoodItem");
const WorkoutTemplate = require("../models/WorkoutTemplate");
const WorkoutPlan = require("../models/WorkoutPlan");
const WellnessTip = require("../models/WellnessTip");
const AiReviewRequest = require("../models/AiReviewRequest");
const {
  computeBmi,
  bmiCategory,
  computeBmr,
  computeTdee,
  estimateBodyFat,
  bodyFatCategory,
  computeCalorieTarget,
} = require("../utils/vitalCalculators");
const { generatePlaceholderReview } = require("../utils/aiReviewStub");

// ---------------------------------------------------------------------
// Calculators (stateless -- BMI / BMR / TDEE / body fat, no save)
// ---------------------------------------------------------------------
async function calculateVitals(req, res, next) {
  try {
    const { heightCm, weightKg, age, gender, activityLevel, waist, neck, hip } = req.body;

    const bmi = computeBmi(heightCm, weightKg);
    const bmr = computeBmr({ heightCm, weightKg, age, gender });
    const tdee = computeTdee(bmr, activityLevel);
    const bodyFatPercent = estimateBodyFat({ gender, heightCm, waist, neck, hip });

    res.json({
      bmi,
      bmiCategory: bmiCategory(bmi),
      bmr,
      tdee,
      bodyFatPercent,
      bodyFatCategory: bodyFatCategory(bodyFatPercent, gender),
    });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// Body metrics (measurement history / "fat and muscle analysis")
// ---------------------------------------------------------------------
async function saveBodyMetric(req, res, next) {
  try {
    const { heightCm, weightKg, age, gender, activityLevel, measurements = {}, bodyFatPercent, muscleMassKg, notes, forDependentId, forDependentName } = req.body;

    const bmi = computeBmi(heightCm, weightKg);
    const bmr = computeBmr({ heightCm, weightKg, age, gender });
    const tdee = computeTdee(bmr, activityLevel);
    const estimatedBodyFat = bodyFatPercent ?? estimateBodyFat({ gender, heightCm, waist: measurements.waist, neck: measurements.neck, hip: measurements.hip });

    const metric = await BodyMetric.create({
      patient: req.user.id,
      forDependentId: forDependentId || null,
      forDependentName: forDependentName || null,
      heightCm,
      weightKg,
      age,
      gender,
      activityLevel,
      measurements,
      bodyFatPercent: estimatedBodyFat,
      muscleMassKg,
      bmi,
      bmiCategory: bmiCategory(bmi),
      bmr,
      tdee,
      notes,
    });

    res.status(201).json({ metric });
  } catch (err) {
    next(err);
  }
}

async function listMyBodyMetrics(req, res, next) {
  try {
    const { forDependentId, limit = 30 } = req.query;
    const filter = { patient: req.user.id };
    filter.forDependentId = forDependentId || null;
    const metrics = await BodyMetric.find(filter).sort({ recordedAt: -1 }).limit(Math.min(100, Number(limit)));
    res.json({ metrics });
  } catch (err) {
    next(err);
  }
}

async function deleteBodyMetric(req, res, next) {
  try {
    await BodyMetric.findOneAndDelete({ _id: req.params.id, patient: req.user.id });
    res.json({ message: "Entry deleted" });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// Diet planner
// ---------------------------------------------------------------------
async function generateDietPlan(req, res, next) {
  try {
    const { goal, weightKg, tdee, forDependentId, forDependentName } = req.body;

    let effectiveWeight = weightKg;
    let effectiveTdee = tdee;

    if (!effectiveWeight || !effectiveTdee) {
      const latest = await BodyMetric.findOne({ patient: req.user.id, forDependentId: forDependentId || null }).sort({ recordedAt: -1 });
      if (!latest) {
        return res.status(400).json({ message: "No body metrics on file -- log your vitals first, or pass weightKg/tdee directly." });
      }
      effectiveWeight = effectiveWeight || latest.weightKg;
      effectiveTdee = effectiveTdee || latest.tdee;
    }

    const { calorieTarget, macros } = computeCalorieTarget({ tdee: effectiveTdee, goal, weightKg: effectiveWeight });

    // Build one sample day of meals that roughly hits the calorie/macro
    // target, pulled from the food catalog. A simple, transparent greedy
    // pick -- not a "real" optimizer, but gives a usable starting point.
    const foods = await FoodItem.find({});
    const sampleMeals = buildSampleMealPlan(foods, calorieTarget, macros);

    await DietPlan.updateMany({ patient: req.user.id, forDependentId: forDependentId || null, isActive: true }, { isActive: false });

    const plan = await DietPlan.create({
      patient: req.user.id,
      forDependentId: forDependentId || null,
      forDependentName: forDependentName || null,
      goal,
      basedOnWeightKg: effectiveWeight,
      basedOnTdee: effectiveTdee,
      calorieTarget,
      macros,
      sampleMeals,
      isActive: true,
    });

    res.status(201).json({ plan });
  } catch (err) {
    next(err);
  }
}

function buildSampleMealPlan(foods, calorieTarget) {
  const byCategory = (cat) => foods.filter((f) => f.category === cat);
  const mealSplit = [
    { mealType: "breakfast", share: 0.25 },
    { mealType: "lunch", share: 0.35 },
    { mealType: "snack", share: 0.1 },
    { mealType: "dinner", share: 0.3 },
  ];

  const pools = [
    ...byCategory("Indian Staples"),
    ...byCategory("Protein - Meat & Eggs"),
    ...byCategory("Protein - Plant"),
    ...byCategory("Vegetables"),
    ...byCategory("Fruits"),
    ...byCategory("Dairy"),
  ];
  if (pools.length === 0) return [];

  return mealSplit.map(({ mealType, share }) => {
    const targetCalories = Math.round(calorieTarget * share);
    const items = [];
    let runningCalories = 0;
    let attempts = 0;
    while (runningCalories < targetCalories * 0.85 && attempts < 8 && pools.length) {
      const food = pools[Math.floor(Math.random() * pools.length)];
      items.push({
        foodItem: food._id,
        name: food.name,
        servingLabel: food.servingLabel,
        calories: food.calories,
        proteinG: food.proteinG,
        carbsG: food.carbsG,
        fatG: food.fatG,
      });
      runningCalories += food.calories;
      attempts++;
    }
    return { mealType, items };
  });
}

async function listMyDietPlans(req, res, next) {
  try {
    const plans = await DietPlan.find({ patient: req.user.id }).sort({ createdAt: -1 }).limit(10);
    res.json({ plans });
  } catch (err) {
    next(err);
  }
}

async function getActiveDietPlan(req, res, next) {
  try {
    const { forDependentId } = req.query;
    const plan = await DietPlan.findOne({ patient: req.user.id, forDependentId: forDependentId || null, isActive: true }).sort({ createdAt: -1 });
    res.json({ plan });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// Meal log ("calorie counter")
// ---------------------------------------------------------------------
async function logMeal(req, res, next) {
  try {
    const { date, mealType, foodItemId, name, servings = 1, calories, proteinG, carbsG, fatG, forDependentId } = req.body;

    let entryData = { name, calories, proteinG: proteinG || 0, carbsG: carbsG || 0, fatG: fatG || 0 };
    if (foodItemId) {
      const food = await FoodItem.findById(foodItemId);
      if (food) {
        entryData = {
          name: food.name,
          calories: Math.round(food.calories * servings),
          proteinG: Math.round(food.proteinG * servings),
          carbsG: Math.round(food.carbsG * servings),
          fatG: Math.round(food.fatG * servings),
        };
      }
    }

    const entry = await MealLogEntry.create({
      patient: req.user.id,
      forDependentId: forDependentId || null,
      date,
      mealType,
      foodItem: foodItemId || undefined,
      servings,
      ...entryData,
    });

    res.status(201).json({ entry });
  } catch (err) {
    next(err);
  }
}

async function getMealLogForDate(req, res, next) {
  try {
    const { date } = req.params;
    const { forDependentId } = req.query;
    const entries = await MealLogEntry.find({ patient: req.user.id, date, forDependentId: forDependentId || null }).sort({ createdAt: 1 });

    const totals = entries.reduce(
      (acc, e) => ({
        calories: acc.calories + e.calories,
        proteinG: acc.proteinG + e.proteinG,
        carbsG: acc.carbsG + e.carbsG,
        fatG: acc.fatG + e.fatG,
      }),
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
    );

    res.json({ entries, totals });
  } catch (err) {
    next(err);
  }
}

async function deleteMealLogEntry(req, res, next) {
  try {
    await MealLogEntry.findOneAndDelete({ _id: req.params.id, patient: req.user.id });
    res.json({ message: "Entry deleted" });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// Food catalog (search, for the meal logger)
// ---------------------------------------------------------------------
async function searchFoods(req, res, next) {
  try {
    const { search, category } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.$or = [{ name: new RegExp(search, "i") }, { tags: new RegExp(search, "i") }];
    const foods = await FoodItem.find(filter).limit(50);
    res.json({ foods });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// Workout templates (catalog) + patient plans
// ---------------------------------------------------------------------
async function listWorkoutTemplates(req, res, next) {
  try {
    const { sport, level, goal } = req.query;
    const filter = { isActive: true };
    if (sport) filter.sport = sport;
    if (level) filter.level = level;
    if (goal) filter.goal = goal;
    const templates = await WorkoutTemplate.find(filter).sort({ sport: 1, level: 1 });
    res.json({ templates });
  } catch (err) {
    next(err);
  }
}

async function listSports(req, res, next) {
  try {
    const sports = await WorkoutTemplate.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$sport", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({ sports: sports.map((s) => ({ name: s._id, count: s.count })) });
  } catch (err) {
    next(err);
  }
}

async function getWorkoutTemplate(req, res, next) {
  try {
    const template = await WorkoutTemplate.findOne({ _id: req.params.id, isActive: true });
    if (!template) return res.status(404).json({ message: "Template not found" });
    res.json({ template });
  } catch (err) {
    next(err);
  }
}

async function adoptWorkoutTemplate(req, res, next) {
  try {
    const template = await WorkoutTemplate.findOne({ _id: req.params.id, isActive: true });
    if (!template) return res.status(404).json({ message: "Template not found" });

    const { forDependentId, forDependentName } = req.body;

    await WorkoutPlan.updateMany({ patient: req.user.id, forDependentId: forDependentId || null, isActive: true }, { isActive: false });

    const plan = await WorkoutPlan.create({
      patient: req.user.id,
      forDependentId: forDependentId || null,
      forDependentName: forDependentName || null,
      template: template._id,
      sport: template.sport,
      title: template.title,
      level: template.level,
      goal: template.goal,
      durationWeeks: template.durationWeeks,
      weeklySchedule: template.weeklySchedule,
      isActive: true,
    });

    res.status(201).json({ plan });
  } catch (err) {
    next(err);
  }
}

async function getMyActiveWorkoutPlan(req, res, next) {
  try {
    const { forDependentId } = req.query;
    const plan = await WorkoutPlan.findOne({ patient: req.user.id, forDependentId: forDependentId || null, isActive: true });
    res.json({ plan });
  } catch (err) {
    next(err);
  }
}

async function listMyWorkoutPlans(req, res, next) {
  try {
    const plans = await WorkoutPlan.find({ patient: req.user.id }).sort({ createdAt: -1 }).limit(10);
    res.json({ plans });
  } catch (err) {
    next(err);
  }
}

async function completeWorkoutSession(req, res, next) {
  try {
    const { day } = req.body;
    const plan = await WorkoutPlan.findOne({ _id: req.params.id, patient: req.user.id });
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    plan.completedSessions.push({ day });
    await plan.save();
    res.json({ plan });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// AI reviewer (physique / diet) -- placeholder analysis, real upload
// ---------------------------------------------------------------------
async function submitAiReview(req, res, next) {
  try {
    const { type, notes } = req.body;
    if (!["physique", "diet"].includes(type)) return res.status(400).json({ message: "type must be 'physique' or 'diet'" });
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: "Upload at least one photo" });

    const imageUrls = req.files.map((f) => `/uploads/wellness-photos/${f.filename}`);
    const result = generatePlaceholderReview(type);

    const review = await AiReviewRequest.create({
      patient: req.user.id,
      type,
      imageUrls,
      notes,
      isPlaceholder: true,
      result,
    });

    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
}

async function listMyAiReviews(req, res, next) {
  try {
    const { type } = req.query;
    const filter = { patient: req.user.id };
    if (type) filter.type = type;
    const reviews = await AiReviewRequest.find(filter).sort({ createdAt: -1 }).limit(20);
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// Tips feed
// ---------------------------------------------------------------------
async function listTips(req, res, next) {
  try {
    const { category } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    const tips = await WellnessTip.find(filter).sort({ createdAt: -1 }).limit(30);
    res.json({ tips });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  calculateVitals,
  saveBodyMetric,
  listMyBodyMetrics,
  deleteBodyMetric,
  generateDietPlan,
  listMyDietPlans,
  getActiveDietPlan,
  logMeal,
  getMealLogForDate,
  deleteMealLogEntry,
  searchFoods,
  listWorkoutTemplates,
  listSports,
  getWorkoutTemplate,
  adoptWorkoutTemplate,
  getMyActiveWorkoutPlan,
  listMyWorkoutPlans,
  completeWorkoutSession,
  submitAiReview,
  listMyAiReviews,
  listTips,
};
