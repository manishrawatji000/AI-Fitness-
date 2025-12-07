// src/pages/Progress.jsx
import React, { useEffect, useState } from "react";
import API from "../api.js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
  Legend,
} from "recharts";

const Progress = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get("/progress/summary");
        const map = {};

        data.workouts.forEach((w) => {
          const d = new Date(w.date).toLocaleDateString();
          if (!map[d]) map[d] = { date: d, caloriesBurned: 0, protein: 0 };
          map[d].caloriesBurned += w.estimatedCalories || 50;
        });

        data.meals.forEach((m) => {
          const d = new Date(m.date).toLocaleDateString();
          if (!map[d]) map[d] = { date: d, caloriesBurned: 0, protein: 0 };
          map[d].protein += m.protein || 0;
        });

        const arr = Object.values(map).sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        setData(arr);
      } catch (err) {
        console.error(err);
        setError("Could not load progress data (check /progress backend route).");
      }
    };

    load();
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Progress & Trends</h2>
          <p className="card-subtitle">
            Animated charts to show consistency of workouts and protein intake.
          </p>
        </div>
        <div className="badge">
          <span className="badge-dot" />
          Visualization layer
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      {data.length === 0 ? (
        <p className="text-muted">
          No data yet. After you save workouts / meals through backend,
          graphs will appear here.
        </p>
      ) : (
        <>
          <div className="section-label">Calories burned</div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="caloriesBurned" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="section-label" style={{ marginTop: 18 }}>
            Protein intake
          </div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="protein" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default Progress;
