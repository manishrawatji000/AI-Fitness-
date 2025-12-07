// src/pages/Dashboard.jsx
import React from "react";
import StatCard from "../components/StatCard.jsx";

const Dashboard = () => {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Today&apos;s Overview</h2>
          <p className="card-subtitle">
            Snapshot of your training, nutrition and recovery.
          </p>
        </div>
        <div className="badge">
          <span className="badge-dot" />
          All systems ready
        </div>
      </div>

      <div className="stat-grid">
        <StatCard
          label="Calories target"
          value="2200"
          unit="kcal"
          sub="Based on your current metrics"
        />
        <StatCard
          label="Workout goal"
          value="45"
          unit="min"
          sub="Recommended active time"
        />
        <StatCard
          label="Protein target"
          value="120"
          unit="g"
          sub="To support muscle recovery"
        />
      </div>

      <div className="grid-2" style={{ marginTop: 18 }}>
        <div>
          <div className="section-label">What to do next</div>
          <ul className="text-muted" style={{ paddingLeft: 18, marginTop: 6 }}>
            <li>Start a live session in the Workout tab.</li>
            <li>Generate or update your diet plan in the Diet tab.</li>
            <li>
              For viva, open Progress tab to show animated graphs & explain data
              logging.
            </li>
          </ul>
        </div>
        <div>
          <div className="section-label">AI coach notes</div>
          <p className="text-muted" style={{ marginTop: 6 }}>
            Explain that this dashboard combines pose-estimation based training,
            macro-based diet recommendations and visual analytics to create a full
            AI fitness assistant.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
