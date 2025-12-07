// src/pages/Workout.jsx
import React from "react";
import PoseWorkout from "../components/PoseWorkout.jsx";

const Workout = () => {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Live Workout · AI Trainer</h2>
          <p className="card-subtitle">
            Real-time body tracking, form feedback and rep counting using your
            webcam.
          </p>
        </div>
        <div className="badge">
          <span className="badge-dot" />
          Pose model active
        </div>
      </div>
      <PoseWorkout />
    </div>
  );
};

export default Workout;
