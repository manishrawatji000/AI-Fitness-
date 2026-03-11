// src/pages/Diet.jsx
import React, { useState } from "react";
import API from "../api.js";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#34d399", "#60a5fa", "#f59e0b"]; // protein, carbs, fats

const small = {
  fontSize: 13,
  color: "#9ca3af",
};

const cardStyle = {
  background: "linear-gradient(180deg, rgba(2,6,23,0.6), rgba(3,7,20,0.55))",
  borderRadius: 14,
  padding: 18,
  border: "1px solid rgba(148,163,184,0.06)",
  boxShadow: "0 8px 24px rgba(2,6,23,0.6)",
};

const Grid = ({ children }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 420px",
      gap: 20,
      alignItems: "start",
    }}
  >
    {children}
  </div>
);

const Stat = ({ label, value }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ color: "#9ca3af", fontSize: 12 }}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 800, color: "#e6eef6" }}>{value}</div>
  </div>
);

const Spinner = () => (
  <div style={{ padding: 20, textAlign: "center", color: "#9ca3af" }}>Loading…</div>
);

const DownloadButton = ({ data, filename = "diet-plan.json" }) => {
  const onDownload = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button className="btn-secondary" onClick={onDownload} style={{ marginLeft: 8 }}>
      Download JSON
    </button>
  );
};

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
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setMetrics((m) => ({ ...m, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!metrics.age || !metrics.heightCm || !metrics.weightKg) {
      setError("Please fill age, height and weight.");
      return false;
    }
    if (Number(metrics.age) <= 0 || Number(metrics.heightCm) <= 0 || Number(metrics.weightKg) <= 0) {
      setError("Age, height and weight must be positive numbers.");
      return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      // Save metrics (backend can store profile)
      await API.post("/diet/save-metrics", {
        ...metrics,
        age: Number(metrics.age),
        heightCm: Number(metrics.heightCm),
        weightKg: Number(metrics.weightKg),
      });

      // request generated plan
      const { data } = await API.get("/diet/plan");
      setPlan(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error generating diet plan");
    } finally {
      setLoading(false);
    }
  };

  const copyPlan = () => {
    if (!plan) return;
    navigator.clipboard.writeText(JSON.stringify(plan, null, 2));
    alert("Diet plan copied to clipboard");
  };

  // Prepare pie chart data if plan exists
  const macroData =
    plan && plan.dietPlan && plan.dietPlan.macros
      ? [
          { name: "Protein", value: plan.dietPlan.macros.protein },
          { name: "Carbs", value: plan.dietPlan.macros.carbs },
          { name: "Fats", value: plan.dietPlan.macros.fats },
        ]
      : [];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <h2 style={{ margin: 0 }}>Personalized Diet Plan</h2>
          <p style={{ margin: "6px 0 0", color: "#9ca3af" }}>
            FitAI calculates BMR, TDEE and macros, then builds a simple meal chart.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ ...small, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, background: "#34d399", borderRadius: 99, display: "inline-block" }} />
            Nutrition engine
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <form onSubmit={onSubmit} style={{ marginBottom: 12 }}>
          <Grid>
            <div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 140px", minWidth: 120 }}>
                  <label className="form-label">Age</label>
                  <input
                    className="form-input"
                    name="age"
                    inputMode="numeric"
                    value={metrics.age}
                    onChange={onChange}
                    placeholder="e.g. 22"
                  />
                </div>

                <div style={{ flex: "1 1 160px" }}>
                  <label className="form-label">Gender</label>
                  <select className="form-select" name="gender" value={metrics.gender} onChange={onChange}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 180px" }}>
                  <label className="form-label">Height (cm)</label>
                  <input
                    className="form-input"
                    name="heightCm"
                    inputMode="numeric"
                    value={metrics.heightCm}
                    onChange={onChange}
                    placeholder="e.g. 175"
                  />
                </div>

                <div style={{ flex: "1 1 180px" }}>
                  <label className="form-label">Weight (kg)</label>
                  <input
                    className="form-input"
                    name="weightKg"
                    inputMode="numeric"
                    value={metrics.weightKg}
                    onChange={onChange}
                    placeholder="e.g. 70"
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "flex-end" }}>
                <div style={{ flex: "1 1 220px" }}>
                  <label className="form-label">Activity level</label>
                  <select className="form-select" name="activityLevel" value={metrics.activityLevel} onChange={onChange}>
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="active">Active</option>
                    <option value="very_active">Very active</option>
                  </select>
                </div>

                <div style={{ flex: "1 1 160px" }}>
                  <label className="form-label">Goal</label>
                  <select className="form-select" name="goal" value={metrics.goal} onChange={onChange}>
                    <option value="lose">Lose fat</option>
                    <option value="maintain">Maintain</option>
                    <option value="gain">Gain muscle</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-primary" type="submit" disabled={loading}>
                    {loading ? "Generating…" : "Generate plan"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setMetrics({
                        age: "",
                        gender: "male",
                        heightCm: "",
                        weightKg: "",
                        activityLevel: "moderate",
                        goal: "maintain",
                      });
                      setPlan(null);
                      setError("");
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>

              {error && <p className="error-text" style={{ marginTop: 12 }}>{error}</p>}
            </div>

            <div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#9ca3af", fontSize: 12 }}>Preview</div>
                  <div style={{ marginTop: 8, height: 260 }}>
                    {loading ? (
                      <Spinner />
                    ) : plan ? (
                      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: "#9ca3af", fontSize: 12 }}>Calories</div>
                            <div style={{ fontSize: 22, fontWeight: 800 }}>{plan.dietPlan.calories} kcal</div>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <DownloadButton data={plan} />
                            <button className="btn-primary" onClick={copyPlan}>Copy plan</button>
                          </div>
                        </div>

                        <div style={{ flex: 1, display: "flex", gap: 12 }}>
                          <div style={{ width: 140 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={macroData}
                                  dataKey="value"
                                  nameKey="name"
                                  innerRadius={30}
                                  outerRadius={50}
                                  paddingAngle={3}
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                  {macroData.map((entry, idx) => (
                                    <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(v) => `${v} g`} />
                                <Legend verticalAlign="bottom" height={36} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                              <Stat label="Protein (g)" value={plan.dietPlan.macros.protein} />
                              <Stat label="Carbs (g)" value={plan.dietPlan.macros.carbs} />
                              <Stat label="Fats (g)" value={plan.dietPlan.macros.fats} />
                            </div>
                            <div style={{ color: "#9ca3af", fontSize: 13, marginTop: 6 }}>
                              Target distribution based on your goal and activity level.
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: "#9ca3af", fontSize: 13 }}>No plan yet — fill the form and click Generate.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Grid>
        </form>

        {plan && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Sample diet chart</div>
              <div style={{ color: "#9ca3af", fontSize: 13 }}>Based on daily targets</div>
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {plan.dietPlan.meals.map((meal) => (
                <div
                  key={meal.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    padding: 12,
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(148,163,184,0.04)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800 }}>{meal.name}</div>
                    <ul style={{ marginTop: 8, paddingLeft: 18, color: "#cbd5e1" }}>
                      {meal.items.map((item) => (
                        <li key={item} style={{ marginBottom: 4 }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ minWidth: 80, textAlign: "right", color: "#9ca3af" }}>
                    <div style={{ fontSize: 12 }}>Est kcal</div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{meal.calories ?? "-"}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Diet;
