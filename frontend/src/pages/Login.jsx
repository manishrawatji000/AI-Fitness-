// src/pages/Login.jsx
import React, { useState } from "react";
import API from "../api.js";
import { Link } from "react-router-dom";

const Login = ({ onLoginSuccess }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await API.post("/auth/login", form);
      onLoginSuccess(data.token);
    } catch (err) {
      setError(err.response?.data?.message || "Login error");
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Welcome back 👋</h2>
          <p className="card-subtitle">Log in to access your AI fitness coach.</p>
        </div>
        <div className="badge">
          <span className="badge-dot" />
          Secure session
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <form onSubmit={onSubmit} style={{ maxWidth: 340 }}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            className="form-input"
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            placeholder="••••••••"
            required
          />
        </div>
        <button className="btn-primary" type="submit">
          Login
        </button>
      </form>

      <p className="text-muted" style={{ marginTop: 14 }}>
        Don&apos;t have an account?{" "}
        <Link className="btn-link" to="/register">
          Register
        </Link>
      </p>
    </div>
  );
};

export default Login;
