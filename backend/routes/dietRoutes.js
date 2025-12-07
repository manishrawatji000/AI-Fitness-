const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const BodyMetrics = require("../models/BodyMetrics");

function calculateBMR({ gender, weightKg, heightCm, age }) {
  if (gender === "male") {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
}

function activityMultiplier(level) {
  switch (level) {
    case "sedentary": return 1.2;
    case "light": return 1.375;
    case "moderate": return 1.55;
    case "active": return 1.725;
    case "very_active": return 1.9;
    default: return 1.2;
  }
}

router.post("/save-metrics", protect, async (req, res) => {
  try {
    const { age, gender, heightCm, weightKg, activityLevel, goal } = req.body;
    let metrics = await BodyMetrics.findOne({ user: req.user._id });

    if (!metrics) {
      metrics = await BodyMetrics.create({
        user: req.user._id,
        age,
        gender,
        heightCm,
        weightKg,
        activityLevel,
        goal,
      });
    } else {
      Object.assign(metrics, { age, gender, heightCm, weightKg, activityLevel, goal });
      await metrics.save();
    }

    res.json(metrics);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/plan", protect, async (req, res) => {
  try {
    const metrics = await BodyMetrics.findOne({ user: req.user._id });
    if (!metrics) return res.status(400).json({ message: "No body metrics found" });

    const bmr = calculateBMR(metrics);
    let tdee = bmr * activityMultiplier(metrics.activityLevel);

    if (metrics.goal === "lose") tdee *= 0.8;
    else if (metrics.goal === "gain") tdee *= 1.15;

    const calories = Math.round(tdee);
    const protein = Math.round((0.3 * calories) / 4);
    const fats = Math.round((0.25 * calories) / 9);
    const carbs = Math.round((calories - protein * 4 - fats * 9) / 4);

    const dietPlan = {
      calories,
      macros: { protein, carbs, fats },
      meals: [
        {
          name: "Breakfast",
          items: [
            "Oats with milk & nuts",
            "1 banana",
            "1 glass of milk/curd",
          ],
        },
        {
          name: "Lunch",
          items: [
            "2–3 chapatis / rice",
            "Dal + veg sabzi",
            "Salad",
          ],
        },
        {
          name: "Snack",
          items: [
            "Sprouts / chana",
            "Fruit",
          ],
        },
        {
          name: "Dinner",
          items: [
            "2 chapatis",
            "Paneer / dal",
            "Veg sabzi",
          ],
        },
      ],
    };

    res.json({ metrics, bmr: Math.round(bmr), dietPlan });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
