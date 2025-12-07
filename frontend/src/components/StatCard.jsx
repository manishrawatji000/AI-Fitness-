import React from "react";

const StatCard = ({ label, value, unit, sub }) => (
  <div className="stat-card">
    <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 3 }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 600 }}>
      {value}
      {unit && (
        <span style={{ fontSize: 12, marginLeft: 4, color: "#e5e7eb" }}>{unit}</span>
      )}
    </div>
    {sub && (
      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>{sub}</div>
    )}
  </div>
);

export default StatCard;
