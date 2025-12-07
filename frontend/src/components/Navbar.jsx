import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = ({ onLogout }) => {
  const linkClass = ({ isActive }) =>
    "nav-link" + (isActive ? " nav-link-active" : "");

  return (
    <header className="navbar">
      <div className="nav-brand">
        <span className="nav-brand-main">FitAI Trainer</span>
        <span className="nav-brand-sub">AI Fitness &amp; Nutrition Coach</span>
      </div>
      <nav className="nav-links">
        <NavLink to="/dashboard" className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/workout" className={linkClass}>
          Workout
        </NavLink>
        <NavLink to="/diet" className={linkClass}>
          Diet
        </NavLink>
        <NavLink to="/progress" className={linkClass}>
          Progress
        </NavLink>
      </nav>
      <div className="nav-spacer" />
      <button className="nav-logout" onClick={onLogout}>
        Logout
      </button>
    </header>
  );
};

export default Navbar;
