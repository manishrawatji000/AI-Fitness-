import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

import Home from "./pages/Home.jsx";
import SignInPage from "./pages/SignInPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Workout from "./pages/Workout.jsx";
import Diet from "./pages/Diet.jsx";
import Progress from "./pages/Progress.jsx";
import Navbar from "./components/Navbar.jsx";

// ── Spinner shown while Clerk initialises ────────────────────────────────────
const Loader = () => (
  <div style={{
    minHeight: "100vh", display: "flex", alignItems: "center",
    justifyContent: "center", background: "#020617"
  }}>
    <div style={{
      width: 42, height: 42, borderRadius: "50%",
      border: "3px solid rgba(34,211,238,0.15)",
      borderTop: "3px solid #22d3ee",
      animation: "spin 0.75s linear infinite"
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ── Route guards ─────────────────────────────────────────────────────────────
const PrivateRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return <Loader />;
  return isSignedIn ? children : <Navigate to="/sign-in" replace />;
};

const PublicOnlyRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return <Loader />;
  return !isSignedIn ? children : <Navigate to="/dashboard" replace />;
};

// ── Layout for authenticated pages ───────────────────────────────────────────
const AppLayout = ({ children }) => (
  <>
    <Navbar />
    <main style={{ paddingTop: 64 }}>{children}</main>
  </>
);

// ── App ──────────────────────────────────────────────────────────────────────
const App = () => (
  <Routes>
    {/* Public landing */}
    <Route path="/" element={<Home />} />

    {/* Auth pages – redirect away if already signed in */}
    <Route path="/sign-in/*" element={<PublicOnlyRoute><SignInPage /></PublicOnlyRoute>} />
    <Route path="/sign-up/*" element={<PublicOnlyRoute><SignUpPage /></PublicOnlyRoute>} />

    {/* Legacy redirects so old /login & /register links still work */}
    <Route path="/login"    element={<Navigate to="/sign-in" replace />} />
    <Route path="/register" element={<Navigate to="/sign-up" replace />} />

    {/* Protected pages */}
    <Route path="/dashboard" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />
    <Route path="/workout"   element={<PrivateRoute><AppLayout><Workout /></AppLayout></PrivateRoute>} />
    <Route path="/diet"      element={<PrivateRoute><AppLayout><Diet /></AppLayout></PrivateRoute>} />
    <Route path="/progress"  element={<PrivateRoute><AppLayout><Progress /></AppLayout></PrivateRoute>} />

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
