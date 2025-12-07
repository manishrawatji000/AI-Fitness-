// src/pages/Diet.jsx
import React, { useState } from "react";
import API from "../api.js";

const Diet = () => {
  const [metrics, setMetrics] = useState({
    age: "",
    gender: "male",
    heightCm: "",
    weightKg: "",
    activityLevel: "moderate",
    goal: "maintain",
  });
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");

  const onChange = (e) =>
    setMetrics((m) => ({ ...m, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await API.post("/diet/save-metrics", {
        ...metrics,
        age: Number(metrics.age),
        heightCm: Number(metrics.heightCm),
        weightKg: Number(metrics.weightKg),
      });
      const { data } = await API.get("/diet/plan");
      setPlan(data);
    } catch (err) {
      setError(err.response?.data?.message || "Error generating diet plan");
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Personalized Diet Plan</h2>
          <p className="card-subtitle">
            FitAI calculates BMR, TDEE and macros, then builds a simple meal chart.
          </p>
        </div>
        <div className="badge">
          <span className="badge-dot" />
          Nutrition engine
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <form
        onSubmit={onSubmit}
        className="grid-2"
        style={{ alignItems: "flex-start" }}
      >
        <div style={{ maxWidth: 360 }}>
          <div className="form-group">
            <label className="form-label">Age</label>
            <input
              className="form-input"
              name="age"
              value={metrics.age}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select
              className="form-select"
              name="gender"
              value={metrics.gender}
              onChange={onChange}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Height (cm)</label>
            <input
              className="form-input"
              name="heightCm"
              value={metrics.heightCm}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Weight (kg)</label>
            <input
              className="form-input"
              name="weightKg"
              value={metrics.weightKg}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Activity level</label>
            <select
              className="form-select"
              name="activityLevel"
              value={metrics.activityLevel}
              onChange={onChange}
            >
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="very_active">Very active</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Goal</label>
            <select
              className="form-select"
              name="goal"
              value={metrics.goal}
              onChange={onChange}
            >
              <option value="lose">Lose fat</option>
              <option value="maintain">Maintain</option>
              <option value="gain">Gain muscle</option>
            </select>
          </div>
          <button className="btn-primary" type="submit">
            Generate plan
          </button>
        </div>

        {plan && (
          <div>
            <div className="section-label">Daily targets</div>
            <p className="text-muted" style={{ marginTop: 6 }}>
              Calories: <strong>{plan.dietPlan.calories} kcal</strong>
              <br />
              Protein: <strong>{plan.dietPlan.macros.protein} g</strong> · Carbs:{" "}
              <strong>{plan.dietPlan.macros.carbs} g</strong> · Fats:{" "}
              <strong>{plan.dietPlan.macros.fats} g</strong>
            </p>

            <div style={{ marginTop: 10 }}>
              <div className="section-label">Sample diet chart</div>
              {plan.dietPlan.meals.map((meal) => (
                <div
                  key={meal.name}
                  style={{
                    marginTop: 6,
                    padding: 8,
                    borderRadius: 14,
                    border: "1px solid rgba(148,163,184,0.5)",
                  }}
                >
                  <strong>{meal.name}</strong>
                  <ul className="text-muted" style={{ paddingLeft: 18 }}>
                    {meal.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default Diet;
