import React from "react";
import { NavLink, Link } from "react-router-dom";
import { UserButton, useUser } from "@clerk/clerk-react";

const Navbar = () => {
  const { user } = useUser();

  const linkStyle = (isActive) => ({
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 500,
    color: isActive ? "#22d3ee" : "#94a3b8",
    padding: "6px 2px",
    borderBottom: isActive ? "2px solid #22d3ee" : "2px solid transparent",
    transition: "color 0.2s, border-color 0.2s",
  });

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      height: 64,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 36px",
      background: "rgba(2,6,23,0.9)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(148,163,184,0.1)",
    }}>
      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
        <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
          <polygon points="11,2 20,7 20,15 11,20 2,15 2,7" stroke="#22d3ee" strokeWidth="1.5" fill="none"/>
          <polygon points="11,6 16,9 16,13 11,16 6,13 6,9" fill="#22d3ee" opacity="0.3"/>
        </svg>
        <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "0.04em", color: "#f9fafb" }}>
          codeflex<span style={{ color: "#22d3ee" }}>.ai</span>
        </span>
      </Link>

      {/* Nav links */}
      <nav style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <NavLink to="/dashboard" style={({ isActive }) => linkStyle(isActive)}>Dashboard</NavLink>
        <NavLink to="/workout"   style={({ isActive }) => linkStyle(isActive)}>Workout</NavLink>
        <NavLink to="/diet"      style={({ isActive }) => linkStyle(isActive)}>Diet</NavLink>
        <NavLink to="/progress"  style={({ isActive }) => linkStyle(isActive)}>Progress</NavLink>
      </nav>

      {/* User info + Clerk UserButton (handles profile & logout) */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {user && (
          <span style={{ fontSize: 13, color: "#64748b" }}>
            {user.firstName ?? user.emailAddresses?.[0]?.emailAddress?.split("@")[0]}
          </span>
        )}

        <UserButton
          afterSignOutUrl="/"
          appearance={{
            variables: {
              colorPrimary:       "#22d3ee",
              colorBackground:    "#0f172a",
              colorText:          "#f9fafb",
              colorTextSecondary: "#94a3b8",
              borderRadius:       "10px",
            },
            elements: {
              avatarBox: {
                width: 36, height: 36,
                border: "2px solid rgba(34,211,238,0.45)",
                borderRadius: "50%",
                boxShadow: "0 0 14px rgba(34,211,238,0.2)",
              },
              userButtonPopoverCard: {
                background:     "rgba(15,23,42,0.97)",
                border:         "1px solid rgba(148,163,184,0.15)",
                borderRadius:   "12px",
                boxShadow:      "0 20px 50px rgba(0,0,0,0.5)",
                backdropFilter: "blur(16px)",
              },
              userButtonPopoverActionButton: { color: "#e2e8f0" },
              userButtonPopoverActionButtonText: { color: "#e2e8f0" },
              userButtonPopoverFooter: { display: "none" },
            },
          }}
        />
      </div>
    </header>
  );
};

export default Navbar;
