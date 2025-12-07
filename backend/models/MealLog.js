const mongoose = require("mongoose");

const mealLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },
    mealType: { type: String, enum: ["breakfast", "lunch", "dinner", "snack"] },
    foodName: String,
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("MealLog", mealLogSchema);
