import React from "react";
import StatCard from "../components/StatCard.jsx";
import VoiceAssistant from "../components/VoiceAssistant.jsx";

const Dashboard = () => {
  return (
    <>
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Today's Overview</h2>
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
          <StatCard
            label="Water intake"
            value="1.8"
            unit="L"
            sub="Stay hydrated"
          />
        </div>
      </div>

      {/* AI Voice Assistant */}
      <div style={{ marginTop: 24 }}>
        <VoiceAssistant />
      </div>

      {/* Tips Section */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="section-label">What to do next</div>
        <ul className="text-muted" style={{ paddingLeft: 20 }}>
          <li>Start a live session in the Workout tab for AI form feedback</li>
          <li>Use voice assistant to ask about exercises and nutrition</li>
          <li>Generate your personalized diet plan in the Diet tab</li>
          <li>Track your progress with animated graphs in Progress tab</li>
        </ul>
      </div>
    </>
  );
};

export default Dashboard;