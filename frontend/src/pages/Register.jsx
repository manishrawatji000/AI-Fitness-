// src/pages/Register.jsx
import React, { useState } from "react";
import API from "../api.js";
import { Link } from "react-router-dom";

const Register = ({ onRegistered }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await API.post("/auth/register", form);
      onRegistered(data.token);
    } catch (err) {
      setError(err.response?.data?.message || "Server error");
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Create your account 💪</h2>
          <p className="card-subtitle">
            Setup your profile so FitAI can coach you better.
          </p>
        </div>
        <div className="badge">
          <span className="badge-dot" />
          Step 1 · Profile
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <form onSubmit={onSubmit} style={{ maxWidth: 340 }}>
        <div className="form-group">
          <label className="form-label">Name</label>
          <input
            className="form-input"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Neeraj"
            required
          />
        </div>
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
          Register
        </button>
      </form>

      <p className="text-muted" style={{ marginTop: 14 }}>
        Already have an account?{" "}
        <Link className="btn-link" to="/login">
          Login
        </Link>
      </p>
    </div>
  );
};

export default Register;
