const mongoose = require("mongoose");

const workoutSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },
    exercise: String,
    reps: Number,
    durationMinutes: Number,
    estimatedCalories: Number,
    formScore: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("WorkoutSession", workoutSessionSchema);
