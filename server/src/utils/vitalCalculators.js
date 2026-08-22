const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2, // little/no exercise
  light: 1.375, // 1-3 days/week
  moderate: 1.55, // 3-5 days/week
  active: 1.725, // 6-7 days/week
  very_active: 1.9, // athlete / physical job
};

function round(n, dp = 1) {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

function computeBmi(heightCm, weightKg) {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return round(bmi, 1);
}

function bmiCategory(bmi) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

/** Mifflin-St Jeor equation -- the most accurate widely-used BMR formula. */
function computeBmr({ heightCm, weightKg, age, gender }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = gender === "male" ? base + 5 : gender === "female" ? base - 161 : base - 78; // "other": midpoint
  return Math.round(bmr);
}

function computeTdee(bmr, activityLevel = "moderate") {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || ACTIVITY_MULTIPLIERS.moderate;
  return Math.round(bmr * multiplier);
}

/**
 * U.S. Navy body-fat % estimate from circumference measurements (cm).
 * Needs waist + neck (+ hip for females). Returns null if inputs missing.
 */
function estimateBodyFat({ gender, heightCm, waist, neck, hip }) {
  if (!waist || !neck || !heightCm) return null;
  if (gender === "male") {
    const val = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(heightCm)) - 450;
    return val > 0 && val < 70 ? round(val, 1) : null;
  }
  if (gender === "female") {
    if (!hip) return null;
    const val = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.221 * Math.log10(heightCm)) - 450;
    return val > 0 && val < 70 ? round(val, 1) : null;
  }
  return null;
}

function bodyFatCategory(percent, gender) {
  if (percent == null) return null;
  const ranges =
    gender === "female"
      ? [[0, 13, "Essential fat"], [14, 20, "Athletic"], [21, 24, "Fit"], [25, 31, "Average"], [32, 100, "Above average"]]
      : [[0, 5, "Essential fat"], [6, 13, "Athletic"], [14, 17, "Fit"], [18, 24, "Average"], [25, 100, "Above average"]];
  const match = ranges.find(([min, max]) => percent >= min && percent <= max);
  return match ? match[2] : null;
}

const GOAL_ADJUSTMENTS = {
  weight_loss: -0.2, // 20% deficit
  mild_weight_loss: -0.1,
  maintenance: 0,
  mild_weight_gain: 0.1,
  muscle_gain: 0.15,
};

const GOAL_MACROS = {
  // grams per kg bodyweight; carbs fill the remaining calories
  weight_loss: { proteinPerKg: 2.0, fatPerKg: 0.9 },
  mild_weight_loss: { proteinPerKg: 1.8, fatPerKg: 0.9 },
  maintenance: { proteinPerKg: 1.6, fatPerKg: 0.9 },
  mild_weight_gain: { proteinPerKg: 1.8, fatPerKg: 1.0 },
  muscle_gain: { proteinPerKg: 2.0, fatPerKg: 1.0 },
};

/** Builds a calorie + macro target for a diet plan given TDEE, goal and bodyweight. */
function computeCalorieTarget({ tdee, goal = "maintenance", weightKg }) {
  const adjustment = GOAL_ADJUSTMENTS[goal] ?? 0;
  const calorieTarget = Math.round(tdee * (1 + adjustment));

  const macroRule = GOAL_MACROS[goal] || GOAL_MACROS.maintenance;
  const proteinG = Math.round(macroRule.proteinPerKg * weightKg);
  const fatG = Math.round(macroRule.fatPerKg * weightKg);
  const proteinKcal = proteinG * 4;
  const fatKcal = fatG * 9;
  const carbsKcal = Math.max(0, calorieTarget - proteinKcal - fatKcal);
  const carbsG = Math.round(carbsKcal / 4);

  return {
    calorieTarget,
    macros: { proteinG, fatG, carbsG },
  };
}

module.exports = {
  computeBmi,
  bmiCategory,
  computeBmr,
  computeTdee,
  estimateBodyFat,
  bodyFatCategory,
  computeCalorieTarget,
  ACTIVITY_MULTIPLIERS,
};
