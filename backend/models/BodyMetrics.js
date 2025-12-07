const mongoose = require("mongoose");

const bodyMetricsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    age: Number,
    gender: { type: String, enum: ["male", "female"], required: true },
    heightCm: Number,
    weightKg: Number,
    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "very_active"],
    },
    goal: {
      type: String,
      enum: ["lose", "maintain", "gain"],
      default: "maintain",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BodyMetrics", bodyMetricsSchema);
