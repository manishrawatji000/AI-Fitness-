const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const WorkoutSession = require("../models/WorkoutSession");
const MealLog = require("../models/MealLog");

// Simple last 7 days summary
router.get("/summary", protect, async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const workouts = await WorkoutSession.find({
      user: req.user._id,
      date: { $gte: since },
    });

    const meals = await MealLog.find({
      user: req.user._id,
      date: { $gte: since },
    });

    res.json({ workouts, meals });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
