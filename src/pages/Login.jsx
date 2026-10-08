import { useState } from "react";
import "./Auth.css";

const API_URL = import.meta.env.VITE_API_URL;

function Login({ onLogin, onBack, onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("gapsToken", data.token);
      localStorage.setItem("gapsMember", JSON.stringify(data.member));

      onLogin(data.member);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button className="back-button" onClick={onBack}>
          ← Back to GAPS website
        </button>

        <div className="auth-logo">
          <div className="gaps-mark">GAPS</div>
        </div>

        <h1>Member Portal</h1>

        <p className="auth-subtitle">
          Sign in to access your GAPS member account.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>Email Address</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-divider">
          <span>New to GAPS?</span>
        </div>

        <button className="secondary-auth-button" onClick={onRegister}>
          Apply for Membership
        </button>

        <p className="auth-note">
          Membership applications are subject to administrative review.
        </p>
      </div>
    </div>
  );
}

export default Login;