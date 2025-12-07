import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Workout from "./pages/Workout.jsx";
import Diet from "./pages/Diet.jsx";
import Progress from "./pages/Progress.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

const PrivateRoute = ({ token, children }) => {
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const AuthedLayout = ({ children }) => (
    <>
      <Navbar onLogout={handleLogout} />
      <main className="app-main fade-in">{children}</main>
    </>
  );

  return (
    <div className="app-shell">
      <Routes>
        {/* auth routes */}
        <Route
          path="/login"
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <main className="app-main fade-in">
                <Login onLoginSuccess={handleLoginSuccess} />
              </main>
            )
          }
        />
        <Route
          path="/register"
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <main className="app-main fade-in">
                <Register onRegistered={handleLoginSuccess} />
              </main>
            )
          }
        />

        {/* redirect root */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* private pages */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute token={token}>
              <AuthedLayout>
                <Dashboard />
              </AuthedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/workout"
          element={
            <PrivateRoute token={token}>
              <AuthedLayout>
                <Workout />
              </AuthedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/diet"
          element={
            <PrivateRoute token={token}>
              <AuthedLayout>
                <Diet />
              </AuthedLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <PrivateRoute token={token}>
              <AuthedLayout>
                <Progress />
              </AuthedLayout>
            </PrivateRoute>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default App;
