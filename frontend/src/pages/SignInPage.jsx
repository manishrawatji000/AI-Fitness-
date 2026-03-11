import React from "react";
import { SignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const clerkAppearance = {
  variables: {
    colorPrimary:          "#22d3ee",
    colorBackground:       "#0f172a",
    colorInputBackground:  "#020617",
    colorInputText:        "#f9fafb",
    colorText:             "#f9fafb",
    colorTextSecondary:    "#94a3b8",
    colorDanger:           "#f87171",
    borderRadius:          "10px",
  },
  elements: {
    rootBox: { width: "100%" },
    card: {
      background:    "rgba(15,23,42,0.95)",
      border:        "1px solid rgba(148,163,184,0.15)",
      borderRadius:  "16px",
      boxShadow:     "0 25px 60px rgba(0,0,0,0.5)",
      backdropFilter:"blur(20px)",
      padding:       "32px",
    },
    headerTitle:              { color: "#f9fafb", fontSize: "22px", fontWeight: "700" },
    headerSubtitle:           { color: "#94a3b8" },
    socialButtonsBlockButton: {
      background:  "rgba(2,6,23,0.8)",
      border:      "1px solid rgba(148,163,184,0.2)",
      borderRadius:"10px",
      color:       "#f9fafb",
    },
    socialButtonsBlockButtonText: { color: "#e2e8f0" },
    dividerLine:   { background: "rgba(148,163,184,0.15)" },
    dividerText:   { color: "#64748b" },
    formFieldLabel:{ color: "#94a3b8", fontSize: "12px" },
    formFieldInput:{
      background:  "rgba(2,6,23,0.8)",
      border:      "1px solid rgba(148,163,184,0.2)",
      borderRadius:"10px",
      color:       "#f9fafb",
      fontSize:    "14px",
    },
    formButtonPrimary: {
      background:   "linear-gradient(135deg, #22d3ee, #0891b2)",
      color:        "#020617",
      fontWeight:   "700",
      borderRadius: "10px",
      border:       "none",
      boxShadow:    "0 8px 24px rgba(34,211,238,0.3)",
    },
    footerActionLink: { color: "#22d3ee" },
    alert: {
      background:   "rgba(248,113,113,0.1)",
      border:       "1px solid rgba(248,113,113,0.2)",
      borderRadius: "8px",
    },
    alertText: { color: "#fca5a5" },
  },
};

const SignInPage = () => (
  <div style={{
    minHeight: "100vh", background: "#020617",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "24px", position: "relative", overflow: "hidden",
  }}>
    {/* Grid bg */}
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none",
      backgroundImage:
        "linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px)," +
        "linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)",
      backgroundSize: "60px 60px",
    }} />
    {/* Glow blobs */}
    <div style={{ position:"absolute", top:"-20%", left:"-10%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 70%)", pointerEvents:"none" }} />
    <div style={{ position:"absolute", bottom:"-20%", right:"-10%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(129,140,248,0.07) 0%, transparent 70%)", pointerEvents:"none" }} />

    {/* Logo */}
    <Link to="/" style={{ textDecoration:"none", marginBottom:32, display:"flex", alignItems:"center", gap:8, zIndex:1 }}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <polygon points="11,2 20,7 20,15 11,20 2,15 2,7" stroke="#22d3ee" strokeWidth="1.5" fill="none"/>
        <polygon points="11,6 16,9 16,13 11,16 6,13 6,9" fill="#22d3ee" opacity="0.3"/>
      </svg>
      <span style={{ fontWeight:700, fontSize:20, letterSpacing:"0.04em", color:"#f9fafb" }}>
        codeflex<span style={{ color:"#22d3ee" }}>.ai</span>
      </span>
    </Link>

    {/* Clerk component */}
    <div style={{ zIndex:1, width:"100%", maxWidth:480 }}>
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        afterSignInUrl="/dashboard"
        appearance={clerkAppearance}
      />
    </div>
  </div>
);

export default SignInPage;
