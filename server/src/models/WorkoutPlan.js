const mongoose = require("mongoose");

const workoutPlanSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    forDependentId: { type: mongoose.Schema.Types.ObjectId, default: null },
    forDependentName: { type: String, default: null },

    template: { type: mongoose.Schema.Types.ObjectId, ref: "WorkoutTemplate" },
    sport: { type: String, required: true },
    title: { type: String, required: true },
    level: { type: String, enum: ["beginner", "intermediate", "advanced"], required: true },
    goal: { type: String, required: true },
    durationWeeks: { type: Number, default: 4 },

    weeklySchedule: [
      {
        day: { type: String, required: true },
        focus: { type: String, required: true },
        exercises: [
          {
            name: String,
            sets: Number,
            reps: String,
            restSeconds: Number,
            notes: String,
          },
        ],
      },
    ],

    startDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },

    // Simple session-completion log, used for a lightweight progress view.
    completedSessions: [
      {
        date: { type: Date, default: Date.now },
        day: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("WorkoutPlan", workoutPlanSchema);
