/**
 * Generates a clearly-labeled PLACEHOLDER analysis for the AI Physique/Diet
 * Reviewer. The real vision-model backend is planned for later; this makes
 * the upload -> review flow fully functional today (real photo storage,
 * real request history) without pretending to be a real AI verdict.
 */

const PHYSIQUE_OBSERVATIONS = [
  "Overall posture looks upright and balanced in the photo provided.",
  "Shoulder and hip alignment appear roughly symmetric.",
  "General body composition is visible but a side-angle photo would help confirm details.",
];

const PHYSIQUE_SUGGESTIONS = [
  "Track body measurements every 2 weeks using the Vitals tab for a clearer trend line.",
  "Pair your workout plan's strength days with adequate protein (see your Diet Planner target).",
  "Take progress photos in consistent lighting and pose for the most useful comparisons over time.",
];

const DIET_OBSERVATIONS = [
  "The meal in this photo appears to include a mix of food groups.",
  "Portion size is hard to judge precisely from a photo alone -- logging it in the Calorie Counter will be more accurate.",
];

const DIET_SUGGESTIONS = [
  "Log this meal in the Calorie Counter so it's reflected in today's totals.",
  "Aim to include a visible protein source at each meal to hit your daily protein target.",
  "Pair carb-heavy meals with fiber (vegetables, whole grains) to help manage blood sugar response.",
];

function pick(arr, n) {
  return arr.slice(0, n);
}

function generatePlaceholderReview(type) {
  const isPhysique = type === "physique";
  return {
    summary: isPhysique
      ? "This is a placeholder physique summary. Real AI-powered visual analysis is coming soon -- for now, use your logged body metrics for the most accurate picture."
      : "This is a placeholder meal summary. Real AI-powered food recognition is coming soon -- for now, log this meal manually in the Calorie Counter for accurate tracking.",
    observations: isPhysique ? pick(PHYSIQUE_OBSERVATIONS, 3) : pick(DIET_OBSERVATIONS, 2),
    suggestions: isPhysique ? pick(PHYSIQUE_SUGGESTIONS, 3) : pick(DIET_SUGGESTIONS, 3),
    disclaimer:
      "Placeholder analysis -- not a real AI assessment yet, and never a substitute for medical advice. Talk to a doctor or nutritionist for personalized guidance.",
  };
}

module.exports = { generatePlaceholderReview };
