/**
 * Run once: `npm run seed:wellness`
 * Seeds the Phase 5 wellness catalogs: a food database for the calorie
 * counter, workout program templates across 10+ sports, and a tips feed.
 * Safe to re-run -- wipes and reseeds these three collections only.
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const FoodItem = require("../models/FoodItem");
const WorkoutTemplate = require("../models/WorkoutTemplate");
const WellnessTip = require("../models/WellnessTip");

const foods = [
  // ---- Indian Staples ----
  { name: "Roti (whole wheat)", category: "Indian Staples", servingLabel: "1 roti (40g)", calories: 104, proteinG: 3.1, carbsG: 20, fatG: 1.7, fiberG: 2.7, isVeg: true, tags: ["staple"] },
  { name: "White rice, cooked", category: "Indian Staples", servingLabel: "1 cup (150g)", calories: 195, proteinG: 4, carbsG: 44, fatG: 0.4, fiberG: 0.6, isVeg: true, tags: ["staple"] },
  { name: "Brown rice, cooked", category: "Indian Staples", servingLabel: "1 cup (150g)", calories: 172, proteinG: 3.8, carbsG: 36, fatG: 1.3, fiberG: 2.2, isVeg: true, tags: ["staple", "high-fiber"] },
  { name: "Dal (lentil curry)", category: "Indian Staples", servingLabel: "1 bowl (150g)", calories: 150, proteinG: 9, carbsG: 20, fatG: 4, fiberG: 5, isVeg: true, tags: ["protein", "staple"] },
  { name: "Idli", category: "Indian Staples", servingLabel: "2 pieces", calories: 78, proteinG: 2.4, carbsG: 16, fatG: 0.3, fiberG: 0.6, isVeg: true, tags: ["breakfast"] },
  { name: "Poha", category: "Indian Staples", servingLabel: "1 plate (200g)", calories: 250, proteinG: 5, carbsG: 45, fatG: 6, fiberG: 2, isVeg: true, tags: ["breakfast"] },
  { name: "Upma", category: "Indian Staples", servingLabel: "1 plate (200g)", calories: 230, proteinG: 6, carbsG: 38, fatG: 6, fiberG: 3, isVeg: true, tags: ["breakfast"] },
  { name: "Paratha (plain)", category: "Indian Staples", servingLabel: "1 piece (60g)", calories: 210, proteinG: 4, carbsG: 27, fatG: 9, fiberG: 2, isVeg: true, tags: ["breakfast"] },

  // ---- Protein - Meat & Eggs ----
  { name: "Chicken breast, grilled", category: "Protein - Meat & Eggs", servingLabel: "100g", calories: 165, proteinG: 31, carbsG: 0, fatG: 3.6, fiberG: 0, isVeg: false, tags: ["high-protein", "lean"] },
  { name: "Boiled egg", category: "Protein - Meat & Eggs", servingLabel: "1 large egg", calories: 78, proteinG: 6.3, carbsG: 0.6, fatG: 5.3, fiberG: 0, isVeg: false, tags: ["high-protein"] },
  { name: "Egg whites", category: "Protein - Meat & Eggs", servingLabel: "2 whites", calories: 34, proteinG: 7.2, carbsG: 0.5, fatG: 0.1, fiberG: 0, isVeg: false, tags: ["high-protein", "lean"] },
  { name: "Fish (rohu), curry", category: "Protein - Meat & Eggs", servingLabel: "1 piece (100g)", calories: 180, proteinG: 20, carbsG: 4, fatG: 9, fiberG: 0.5, isVeg: false, tags: ["protein"] },
  { name: "Mutton curry", category: "Protein - Meat & Eggs", servingLabel: "100g", calories: 250, proteinG: 18, carbsG: 5, fatG: 17, fiberG: 0.5, isVeg: false, tags: ["protein"] },

  // ---- Protein - Plant ----
  { name: "Paneer (grilled)", category: "Protein - Plant", servingLabel: "100g", calories: 265, proteinG: 18, carbsG: 3.4, fatG: 20, fiberG: 0, isVeg: true, tags: ["high-protein", "vegetarian"] },
  { name: "Tofu", category: "Protein - Plant", servingLabel: "100g", calories: 76, proteinG: 8, carbsG: 1.9, fatG: 4.8, fiberG: 0.3, isVeg: true, tags: ["high-protein", "vegan"] },
  { name: "Chickpeas (chana), boiled", category: "Protein - Plant", servingLabel: "1 cup (165g)", calories: 269, proteinG: 15, carbsG: 45, fatG: 4, fiberG: 12.5, isVeg: true, tags: ["protein", "high-fiber"] },
  { name: "Rajma (kidney beans curry)", category: "Protein - Plant", servingLabel: "1 bowl (150g)", calories: 170, proteinG: 9, carbsG: 26, fatG: 3, fiberG: 8, isVeg: true, tags: ["protein"] },
  { name: "Sprouts salad", category: "Protein - Plant", servingLabel: "1 cup (100g)", calories: 100, proteinG: 7, carbsG: 17, fatG: 0.6, fiberG: 4, isVeg: true, tags: ["protein", "low-calorie"] },

  // ---- Dairy ----
  { name: "Milk (toned)", category: "Dairy", servingLabel: "1 glass (250ml)", calories: 125, proteinG: 8, carbsG: 12, fatG: 5, fiberG: 0, isVeg: true, tags: ["dairy"] },
  { name: "Curd / yogurt (plain)", category: "Dairy", servingLabel: "1 cup (200g)", calories: 120, proteinG: 7, carbsG: 9, fatG: 6, fiberG: 0, isVeg: true, tags: ["dairy", "probiotic"] },
  { name: "Greek yogurt", category: "Dairy", servingLabel: "1 cup (200g)", calories: 146, proteinG: 20, carbsG: 8, fatG: 4, fiberG: 0, isVeg: true, tags: ["high-protein", "dairy"] },
  { name: "Whey protein shake", category: "Dairy", servingLabel: "1 scoop + water", calories: 120, proteinG: 24, carbsG: 3, fatG: 1.5, fiberG: 0, isVeg: true, tags: ["high-protein", "post-workout"] },

  // ---- Fruits ----
  { name: "Banana", category: "Fruits", servingLabel: "1 medium", calories: 105, proteinG: 1.3, carbsG: 27, fatG: 0.4, fiberG: 3.1, isVeg: true, tags: ["pre-workout"] },
  { name: "Apple", category: "Fruits", servingLabel: "1 medium", calories: 95, proteinG: 0.5, carbsG: 25, fatG: 0.3, fiberG: 4.4, isVeg: true, tags: ["low-calorie"] },
  { name: "Orange", category: "Fruits", servingLabel: "1 medium", calories: 62, proteinG: 1.2, carbsG: 15, fatG: 0.2, fiberG: 3.1, isVeg: true, tags: ["vitamin-c"] },
  { name: "Mango", category: "Fruits", servingLabel: "1 cup sliced (165g)", calories: 99, proteinG: 1.4, carbsG: 25, fatG: 0.6, fiberG: 2.6, isVeg: true, tags: [] },
  { name: "Mixed berries", category: "Fruits", servingLabel: "1 cup (150g)", calories: 70, proteinG: 1, carbsG: 17, fatG: 0.4, fiberG: 4, isVeg: true, tags: ["low-calorie", "antioxidant"] },

  // ---- Vegetables ----
  { name: "Mixed sabzi (sauteed)", category: "Vegetables", servingLabel: "1 bowl (150g)", calories: 120, proteinG: 3, carbsG: 12, fatG: 7, fiberG: 4, isVeg: true, tags: [] },
  { name: "Salad (cucumber, tomato, onion)", category: "Vegetables", servingLabel: "1 bowl (150g)", calories: 40, proteinG: 1.5, carbsG: 8, fatG: 0.3, fiberG: 2, isVeg: true, tags: ["low-calorie"] },
  { name: "Spinach (palak), cooked", category: "Vegetables", servingLabel: "1 cup (180g)", calories: 41, proteinG: 5.3, carbsG: 6.8, fatG: 0.5, fiberG: 4.3, isVeg: true, tags: ["low-calorie", "iron"] },
  { name: "Broccoli, steamed", category: "Vegetables", servingLabel: "1 cup (150g)", calories: 55, proteinG: 3.7, carbsG: 11, fatG: 0.6, fiberG: 5, isVeg: true, tags: ["low-calorie"] },

  // ---- Nuts & Seeds ----
  { name: "Almonds", category: "Nuts & Seeds", servingLabel: "10 pieces (12g)", calories: 70, proteinG: 2.6, carbsG: 2.5, fatG: 6, fiberG: 1.5, isVeg: true, tags: ["healthy-fat"] },
  { name: "Peanut butter", category: "Nuts & Seeds", servingLabel: "1 tbsp (16g)", calories: 95, proteinG: 3.6, carbsG: 3.2, fatG: 8.2, fiberG: 1, isVeg: true, tags: ["healthy-fat"] },
  { name: "Mixed nuts", category: "Nuts & Seeds", servingLabel: "small handful (20g)", calories: 120, proteinG: 4, carbsG: 4, fatG: 10, fiberG: 2, isVeg: true, tags: ["healthy-fat"] },

  // ---- Beverages ----
  { name: "Green tea", category: "Beverages", servingLabel: "1 cup, unsweetened", calories: 2, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0, isVeg: true, tags: ["low-calorie"] },
  { name: "Black coffee", category: "Beverages", servingLabel: "1 cup, unsweetened", calories: 2, proteinG: 0.3, carbsG: 0, fatG: 0, fiberG: 0, isVeg: true, tags: ["low-calorie"] },
  { name: "Coconut water", category: "Beverages", servingLabel: "1 glass (240ml)", calories: 46, proteinG: 1.7, carbsG: 9, fatG: 0.5, fiberG: 2.6, isVeg: true, tags: ["hydration"] },

  // ---- Snacks ----
  { name: "Protein bar", category: "Snacks", servingLabel: "1 bar (50g)", calories: 200, proteinG: 15, carbsG: 20, fatG: 7, fiberG: 3, isVeg: true, tags: ["high-protein"] },
  { name: "Roasted chana (chickpeas)", category: "Snacks", servingLabel: "1 small bowl (40g)", calories: 140, proteinG: 8, carbsG: 22, fatG: 2, fiberG: 6, isVeg: true, tags: ["high-fiber"] },
];

const workoutTemplates = [
  {
    sport: "Boxing", title: "Boxing Foundations", level: "beginner", goal: "skill", durationWeeks: 4, sessionsPerWeek: 4,
    description: "Build footwork, guard, and the four basic punches while developing conditioning.",
    estimatedCaloriesPerSession: 450, equipmentNeeded: ["Boxing gloves", "Heavy bag", "Skipping rope"],
    weeklySchedule: [
      { day: "Day 1", focus: "Footwork & Jab-Cross", exercises: [{ name: "Shadow boxing", sets: 4, reps: "3 min", restSeconds: 60 }, { name: "Jab-cross combos on bag", sets: 6, reps: "2 min", restSeconds: 60 }, { name: "Skipping rope", sets: 3, reps: "3 min", restSeconds: 60 }] },
      { day: "Day 2", focus: "Conditioning", exercises: [{ name: "Burpees", sets: 4, reps: "12", restSeconds: 45 }, { name: "Mountain climbers", sets: 4, reps: "30 sec", restSeconds: 30 }, { name: "Plank", sets: 3, reps: "45 sec", restSeconds: 30 }] },
      { day: "Day 3", focus: "Combos & Defense", exercises: [{ name: "4-punch combos on bag", sets: 6, reps: "2 min", restSeconds: 60 }, { name: "Slip drills", sets: 4, reps: "2 min", restSeconds: 45 }, { name: "Core circuit", sets: 3, reps: "10 min", restSeconds: 60 }] },
      { day: "Day 4", focus: "Sparring drills (light)", exercises: [{ name: "Pad work with partner", sets: 6, reps: "2 min", restSeconds: 60 }, { name: "Light technical sparring", sets: 4, reps: "2 min", restSeconds: 90 }] },
    ],
  },
  {
    sport: "MMA", title: "MMA Conditioning & Skills", level: "intermediate", goal: "general_fitness", durationWeeks: 6, sessionsPerWeek: 5,
    description: "Combines striking, grappling drills and high-intensity conditioning for all-round MMA fitness.",
    estimatedCaloriesPerSession: 550, equipmentNeeded: ["Gloves", "Grappling mat", "Kettlebell"],
    weeklySchedule: [
      { day: "Day 1", focus: "Striking", exercises: [{ name: "Combo striking on pads", sets: 6, reps: "3 min", restSeconds: 60 }, { name: "Knee/elbow drills", sets: 4, reps: "2 min", restSeconds: 45 }] },
      { day: "Day 2", focus: "Grappling", exercises: [{ name: "Takedown drills", sets: 5, reps: "3 min", restSeconds: 60 }, { name: "Positional sparring", sets: 4, reps: "4 min", restSeconds: 90 }] },
      { day: "Day 3", focus: "Strength & Power", exercises: [{ name: "Kettlebell swings", sets: 4, reps: "15", restSeconds: 45 }, { name: "Med ball slams", sets: 4, reps: "12", restSeconds: 45 }, { name: "Pull-ups", sets: 4, reps: "6-10", restSeconds: 60 }] },
      { day: "Day 4", focus: "Conditioning circuit", exercises: [{ name: "Battle ropes", sets: 5, reps: "30 sec", restSeconds: 30 }, { name: "Sprawls", sets: 4, reps: "10", restSeconds: 30 }, { name: "Rowing sprints", sets: 5, reps: "250m", restSeconds: 60 }] },
      { day: "Day 5", focus: "Live rounds", exercises: [{ name: "Full sparring rounds", sets: 5, reps: "5 min", restSeconds: 90 }] },
    ],
  },
  {
    sport: "Wrestling", title: "Wrestling Strength & Technique", level: "intermediate", goal: "strength", durationWeeks: 6, sessionsPerWeek: 4,
    description: "Builds explosive strength and grappling technique for freestyle/folkstyle wrestling.",
    estimatedCaloriesPerSession: 500, equipmentNeeded: ["Wrestling mat", "Barbell"],
    weeklySchedule: [
      { day: "Day 1", focus: "Takedowns", exercises: [{ name: "Single leg drills", sets: 5, reps: "10", restSeconds: 45 }, { name: "Double leg drills", sets: 5, reps: "10", restSeconds: 45 }] },
      { day: "Day 2", focus: "Strength", exercises: [{ name: "Squats", sets: 5, reps: "5", restSeconds: 120 }, { name: "Power cleans", sets: 5, reps: "3", restSeconds: 120 }, { name: "Neck bridges", sets: 3, reps: "10", restSeconds: 60 }] },
      { day: "Day 3", focus: "Live wrestling", exercises: [{ name: "Situational live rounds", sets: 6, reps: "2 min", restSeconds: 60 }] },
      { day: "Day 4", focus: "Conditioning", exercises: [{ name: "Sprawls", sets: 5, reps: "10", restSeconds: 30 }, { name: "Sled pushes", sets: 5, reps: "20m", restSeconds: 60 }] },
    ],
  },
  {
    sport: "Gymnastics", title: "Gymnastics Strength & Mobility", level: "beginner", goal: "skill", durationWeeks: 8, sessionsPerWeek: 4,
    description: "Bodyweight strength, flexibility and basic skill progressions (handstands, splits, rings).",
    estimatedCaloriesPerSession: 350, equipmentNeeded: ["Gymnastics rings", "Mat"],
    weeklySchedule: [
      { day: "Day 1", focus: "Handstand practice", exercises: [{ name: "Wall handstand hold", sets: 5, reps: "30 sec", restSeconds: 60 }, { name: "Hollow body hold", sets: 4, reps: "30 sec", restSeconds: 45 }] },
      { day: "Day 2", focus: "Ring strength", exercises: [{ name: "Ring rows", sets: 4, reps: "10", restSeconds: 60 }, { name: "Support hold", sets: 4, reps: "20 sec", restSeconds: 45 }] },
      { day: "Day 3", focus: "Flexibility", exercises: [{ name: "Split stretch", sets: 3, reps: "60 sec/side", restSeconds: 30 }, { name: "Bridge hold", sets: 4, reps: "20 sec", restSeconds: 45 }] },
      { day: "Day 4", focus: "Core & Skills", exercises: [{ name: "L-sit hold", sets: 5, reps: "15 sec", restSeconds: 45 }, { name: "Cartwheel practice", sets: 6, reps: "3 reps", restSeconds: 30 }] },
    ],
  },
  {
    sport: "Running", title: "5K to 10K Progression", level: "beginner", goal: "endurance", durationWeeks: 8, sessionsPerWeek: 4,
    description: "Gradually builds mileage and pace to take you from a comfortable 5K to a 10K.",
    estimatedCaloriesPerSession: 400, equipmentNeeded: ["Running shoes"],
    weeklySchedule: [
      { day: "Day 1", focus: "Easy run", exercises: [{ name: "Easy pace run", sets: 1, reps: "30 min", restSeconds: 0 }] },
      { day: "Day 2", focus: "Interval training", exercises: [{ name: "400m repeats", sets: 8, reps: "400m", restSeconds: 90 }] },
      { day: "Day 3", focus: "Rest / mobility", exercises: [{ name: "Foam rolling + stretching", sets: 1, reps: "20 min", restSeconds: 0 }] },
      { day: "Day 4", focus: "Long run", exercises: [{ name: "Long slow distance run", sets: 1, reps: "50-60 min", restSeconds: 0 }] },
    ],
  },
  {
    sport: "Swimming", title: "Swim Endurance Builder", level: "intermediate", goal: "endurance", durationWeeks: 6, sessionsPerWeek: 4,
    description: "Builds aerobic base and stroke efficiency across freestyle, backstroke and breaststroke.",
    estimatedCaloriesPerSession: 450, equipmentNeeded: ["Pool access", "Kickboard"],
    weeklySchedule: [
      { day: "Day 1", focus: "Technique", exercises: [{ name: "Freestyle drills", sets: 6, reps: "50m", restSeconds: 30 }, { name: "Kickboard laps", sets: 4, reps: "50m", restSeconds: 30 }] },
      { day: "Day 2", focus: "Endurance", exercises: [{ name: "Continuous swim", sets: 1, reps: "800m", restSeconds: 0 }] },
      { day: "Day 3", focus: "Speed intervals", exercises: [{ name: "100m repeats", sets: 8, reps: "100m", restSeconds: 45 }] },
      { day: "Day 4", focus: "Mixed strokes", exercises: [{ name: "IM sets (all 4 strokes)", sets: 6, reps: "50m", restSeconds: 40 }] },
    ],
  },
  {
    sport: "Weightlifting / Strength", title: "5x5 Strength Foundations", level: "beginner", goal: "strength", durationWeeks: 8, sessionsPerWeek: 3,
    description: "A classic linear-progression strength program built on compound barbell lifts.",
    estimatedCaloriesPerSession: 350, equipmentNeeded: ["Barbell", "Squat rack", "Bench"],
    weeklySchedule: [
      { day: "Day 1", focus: "Squat + Bench + Row", exercises: [{ name: "Back squat", sets: 5, reps: "5", restSeconds: 120 }, { name: "Bench press", sets: 5, reps: "5", restSeconds: 120 }, { name: "Barbell row", sets: 5, reps: "5", restSeconds: 90 }] },
      { day: "Day 2", focus: "Squat + Overhead press + Deadlift", exercises: [{ name: "Back squat", sets: 5, reps: "5", restSeconds: 120 }, { name: "Overhead press", sets: 5, reps: "5", restSeconds: 90 }, { name: "Deadlift", sets: 1, reps: "5", restSeconds: 150 }] },
      { day: "Day 3", focus: "Squat + Bench + Row", exercises: [{ name: "Back squat", sets: 5, reps: "5", restSeconds: 120 }, { name: "Bench press", sets: 5, reps: "5", restSeconds: 120 }, { name: "Barbell row", sets: 5, reps: "5", restSeconds: 90 }] },
    ],
  },
  {
    sport: "Yoga", title: "Daily Flexibility & Mindfulness Flow", level: "beginner", goal: "general_fitness", durationWeeks: 4, sessionsPerWeek: 6,
    description: "A gentle daily flow improving flexibility, breath control and stress relief.",
    estimatedCaloriesPerSession: 180, equipmentNeeded: ["Yoga mat"],
    weeklySchedule: [
      { day: "Day 1", focus: "Sun salutations", exercises: [{ name: "Surya Namaskar", sets: 6, reps: "1 round", restSeconds: 30 }, { name: "Seated forward fold", sets: 1, reps: "60 sec", restSeconds: 0 }] },
      { day: "Day 2", focus: "Balance & core", exercises: [{ name: "Tree pose", sets: 3, reps: "30 sec/side", restSeconds: 15 }, { name: "Boat pose", sets: 3, reps: "30 sec", restSeconds: 30 }] },
      { day: "Day 3", focus: "Hip opening", exercises: [{ name: "Pigeon pose", sets: 2, reps: "60 sec/side", restSeconds: 15 }, { name: "Butterfly stretch", sets: 1, reps: "60 sec", restSeconds: 0 }] },
    ],
  },
  {
    sport: "Football", title: "Football Match Fitness", level: "intermediate", goal: "endurance", durationWeeks: 6, sessionsPerWeek: 4,
    description: "Sprint, agility and ball-work sessions to build match-day sharpness and stamina.",
    estimatedCaloriesPerSession: 500, equipmentNeeded: ["Cones", "Football"],
    weeklySchedule: [
      { day: "Day 1", focus: "Sprint intervals", exercises: [{ name: "40m sprints", sets: 10, reps: "40m", restSeconds: 45 }] },
      { day: "Day 2", focus: "Ball work & agility", exercises: [{ name: "Cone dribbling drills", sets: 6, reps: "2 min", restSeconds: 45 }, { name: "Ladder agility drills", sets: 5, reps: "30 sec", restSeconds: 30 }] },
      { day: "Day 3", focus: "Strength", exercises: [{ name: "Lunges", sets: 4, reps: "12/leg", restSeconds: 45 }, { name: "Box jumps", sets: 4, reps: "8", restSeconds: 60 }] },
      { day: "Day 4", focus: "Small-sided games", exercises: [{ name: "5v5 match play", sets: 4, reps: "10 min", restSeconds: 120 }] },
    ],
  },
  {
    sport: "Basketball", title: "Basketball Athleticism & Skills", level: "intermediate", goal: "skill", durationWeeks: 6, sessionsPerWeek: 4,
    description: "Vertical jump, lateral quickness and shooting/ball-handling development.",
    estimatedCaloriesPerSession: 480, equipmentNeeded: ["Basketball", "Cones"],
    weeklySchedule: [
      { day: "Day 1", focus: "Shooting", exercises: [{ name: "Spot-up shooting", sets: 6, reps: "10 shots", restSeconds: 45 }, { name: "Free throws", sets: 5, reps: "10", restSeconds: 30 }] },
      { day: "Day 2", focus: "Vertical & power", exercises: [{ name: "Box jumps", sets: 5, reps: "8", restSeconds: 60 }, { name: "Depth jumps", sets: 4, reps: "6", restSeconds: 60 }] },
      { day: "Day 3", focus: "Ball handling", exercises: [{ name: "Two-ball dribbling drills", sets: 5, reps: "1 min", restSeconds: 30 }, { name: "Cone crossovers", sets: 5, reps: "1 min", restSeconds: 30 }] },
      { day: "Day 4", focus: "Scrimmage", exercises: [{ name: "5v5 game play", sets: 4, reps: "10 min", restSeconds: 90 }] },
    ],
  },
  {
    sport: "Cycling", title: "Cycling Endurance & Power", level: "intermediate", goal: "endurance", durationWeeks: 6, sessionsPerWeek: 4,
    description: "Builds aerobic base and climbing power through structured rides and intervals.",
    estimatedCaloriesPerSession: 500, equipmentNeeded: ["Bicycle"],
    weeklySchedule: [
      { day: "Day 1", focus: "Endurance ride", exercises: [{ name: "Steady-state ride", sets: 1, reps: "60 min", restSeconds: 0 }] },
      { day: "Day 2", focus: "Hill intervals", exercises: [{ name: "Hill climb repeats", sets: 6, reps: "3 min", restSeconds: 120 }] },
      { day: "Day 3", focus: "Speed intervals", exercises: [{ name: "1 min sprints", sets: 10, reps: "1 min", restSeconds: 90 }] },
      { day: "Day 4", focus: "Recovery ride", exercises: [{ name: "Easy spin", sets: 1, reps: "30 min", restSeconds: 0 }] },
    ],
  },
  {
    sport: "CrossFit / Functional", title: "Functional Fitness WODs", level: "intermediate", goal: "general_fitness", durationWeeks: 4, sessionsPerWeek: 5,
    description: "High-intensity functional workouts mixing strength, gymnastics and conditioning.",
    estimatedCaloriesPerSession: 500, equipmentNeeded: ["Barbell", "Kettlebell", "Pull-up bar"],
    weeklySchedule: [
      { day: "Day 1", focus: "AMRAP", exercises: [{ name: "Kettlebell swings", sets: 1, reps: "AMRAP", restSeconds: 0, notes: "20 min AMRAP: 10 swings, 10 push-ups, 10 air squats" }] },
      { day: "Day 2", focus: "Strength", exercises: [{ name: "Deadlift", sets: 5, reps: "5", restSeconds: 120 }, { name: "Strict pull-ups", sets: 4, reps: "6-8", restSeconds: 90 }] },
      { day: "Day 3", focus: "Metcon", exercises: [{ name: "For time: 21-15-9", sets: 1, reps: "thrusters + burpees", restSeconds: 0 }] },
      { day: "Day 4", focus: "Gymnastics skill", exercises: [{ name: "Toes-to-bar practice", sets: 5, reps: "8", restSeconds: 60 }, { name: "Handstand push-ups", sets: 4, reps: "5", restSeconds: 60 }] },
      { day: "Day 5", focus: "Team WOD", exercises: [{ name: "Partner conditioning circuit", sets: 1, reps: "20 min", restSeconds: 0 }] },
    ],
  },
  {
    sport: "Calisthenics", title: "Bodyweight Strength Progressions", level: "beginner", goal: "strength", durationWeeks: 8, sessionsPerWeek: 4,
    description: "Progress from basic push/pull/squat patterns toward pull-ups, dips and pistol squats.",
    estimatedCaloriesPerSession: 320, equipmentNeeded: ["Pull-up bar", "Parallel bars (optional)"],
    weeklySchedule: [
      { day: "Day 1", focus: "Push", exercises: [{ name: "Push-ups", sets: 4, reps: "12-15", restSeconds: 60 }, { name: "Pike push-ups", sets: 3, reps: "8-10", restSeconds: 60 }, { name: "Dips (assisted if needed)", sets: 3, reps: "6-10", restSeconds: 60 }] },
      { day: "Day 2", focus: "Pull", exercises: [{ name: "Pull-ups (assisted if needed)", sets: 4, reps: "5-8", restSeconds: 60 }, { name: "Inverted rows", sets: 3, reps: "10-12", restSeconds: 60 }] },
      { day: "Day 3", focus: "Legs", exercises: [{ name: "Bodyweight squats", sets: 4, reps: "20", restSeconds: 45 }, { name: "Bulgarian split squats", sets: 3, reps: "10/leg", restSeconds: 60 }, { name: "Pistol squat progression", sets: 3, reps: "5/leg", restSeconds: 60 }] },
      { day: "Day 4", focus: "Core & skills", exercises: [{ name: "Hanging leg raises", sets: 4, reps: "10", restSeconds: 45 }, { name: "Plank to push-up", sets: 3, reps: "10", restSeconds: 45 }] },
    ],
  },
  {
    sport: "Badminton", title: "Badminton Speed & Agility", level: "beginner", goal: "skill", durationWeeks: 4, sessionsPerWeek: 3,
    description: "Court movement, reaction speed, and shot practice for singles/doubles play.",
    estimatedCaloriesPerSession: 400, equipmentNeeded: ["Racket", "Shuttlecocks", "Cones"],
    weeklySchedule: [
      { day: "Day 1", focus: "Footwork", exercises: [{ name: "Shadow footwork drills", sets: 6, reps: "1 min", restSeconds: 30 }, { name: "Lunges to all corners", sets: 4, reps: "8/corner", restSeconds: 45 }] },
      { day: "Day 2", focus: "Shot practice", exercises: [{ name: "Clear & drop shot repetitions", sets: 6, reps: "10", restSeconds: 45 }, { name: "Smash practice", sets: 5, reps: "10", restSeconds: 45 }] },
      { day: "Day 3", focus: "Match play", exercises: [{ name: "Practice matches", sets: 3, reps: "15 min", restSeconds: 120 }] },
    ],
  },
];

const tips = [
  { category: "nutrition", title: "Protein at every meal", body: "Aim for a palm-sized portion of protein (chicken, dal, paneer, eggs) at each meal to support muscle repair and keep you full longer.", tags: ["protein"], icon: "utensils" },
  { category: "nutrition", title: "Hydrate before you're thirsty", body: "Thirst is a lagging signal. Sip water throughout the day -- aim for pale-yellow urine as a simple hydration check.", tags: ["hydration"], icon: "droplet" },
  { category: "nutrition", title: "Fiber first", body: "Vegetables and whole grains slow digestion and help you feel satisfied on fewer calories -- fill a third of your plate with them.", tags: ["fiber"], icon: "salad" },
  { category: "workout", title: "Warm up with purpose", body: "5-10 minutes of dynamic movement (leg swings, arm circles, light jogging) prepares joints and muscles better than static stretching alone.", tags: ["warmup"], icon: "flame" },
  { category: "workout", title: "Progressive overload wins", body: "Small, consistent increases in weight, reps or intensity over weeks beat sporadic all-out efforts for long-term strength gains.", tags: ["strength"], icon: "trending-up" },
  { category: "recovery", title: "Rest days are training days", body: "Muscle actually rebuilds during rest. Schedule at least 1-2 recovery days a week, especially after high-intensity sessions.", tags: ["rest"], icon: "battery-charging" },
  { category: "recovery", title: "Sleep is your best recovery tool", body: "7-9 hours of quality sleep supports hormone balance, muscle repair and appetite regulation -- more impactful than most supplements.", tags: ["sleep"], icon: "moon" },
  { category: "hydration", title: "Electrolytes matter in heat", body: "On hot days or long workouts, plain water isn't always enough -- add a pinch of salt or an electrolyte drink to replace what you sweat out.", tags: ["electrolytes"], icon: "droplet" },
  { category: "mindset", title: "Track trends, not single days", body: "Weight and measurements fluctuate daily from water and food. Look at your 2-week trend on the Vitals tab instead of any single reading.", tags: ["mindset"], icon: "line-chart" },
  { category: "sleep", title: "Keep a consistent wind-down", body: "Going to bed and waking up at similar times, even on weekends, improves sleep quality more than total hours alone.", tags: ["sleep"], icon: "moon" },
];

async function run() {
  await connectDB();

  await Promise.all([FoodItem.deleteMany({}), WorkoutTemplate.deleteMany({}), WellnessTip.deleteMany({})]);

  await FoodItem.insertMany(foods);
  await WorkoutTemplate.insertMany(workoutTemplates);
  await WellnessTip.insertMany(tips);

  const sportCount = new Set(workoutTemplates.map((w) => w.sport)).size;
  console.log(`Seeded ${foods.length} food items, ${workoutTemplates.length} workout templates across ${sportCount} sports, ${tips.length} wellness tips.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
