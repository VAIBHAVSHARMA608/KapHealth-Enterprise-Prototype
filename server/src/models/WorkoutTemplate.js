const mongoose = require("mongoose");

const SPORTS = [
  "Boxing", "MMA", "Wrestling", "Gymnastics", "Running", "Swimming",
  "Weightlifting / Strength", "Yoga", "Football", "Basketball",
  "Cycling", "CrossFit / Functional", "Calisthenics", "Badminton",
];

const workoutTemplateSchema = new mongoose.Schema(
  {
    sport: { type: String, enum: SPORTS, required: true, index: true },
    title: { type: String, required: true },
    level: { type: String, enum: ["beginner", "intermediate", "advanced"], required: true },
    goal: { type: String, enum: ["fat_loss", "muscle_gain", "endurance", "strength", "skill", "general_fitness"], required: true },
    description: { type: String, maxlength: 800 },
    durationWeeks: { type: Number, default: 4 },
    sessionsPerWeek: { type: Number, default: 4 },
    estimatedCaloriesPerSession: { type: Number },
    equipmentNeeded: [{ type: String }],

    weeklySchedule: [
      {
        day: { type: String, required: true }, // "Monday", "Day 1", etc.
        focus: { type: String, required: true }, // "Upper body strength", "Sparring drills"
        exercises: [
          {
            name: { type: String, required: true },
            sets: Number,
            reps: String, // string to allow "8-12", "AMRAP", "30 sec"
            restSeconds: Number,
            notes: String,
          },
        ],
      },
    ],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

workoutTemplateSchema.index({ sport: 1, level: 1 });

module.exports = mongoose.model("WorkoutTemplate", workoutTemplateSchema);
module.exports.SPORTS = SPORTS;
