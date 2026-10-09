import { useState } from "react";
import "./Auth.css";

const API_URL = import.meta.env.VITE_API_URL;

function Login({
  onLogin,
  onBack,
  onRegister,
  onSwitchPortal,
  portal = "member"
}) {
  const isAdminPortal = portal === "admin";
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

      if (isAdminPortal && data.member.role !== "admin") {
        throw new Error(
          "This account is not an administrator. Please use Member Portal sign-in."
        );
      }

      if (!isAdminPortal && data.member.role === "admin") {
        throw new Error(
          "This is an administrator account. Please use Admin Portal sign-in."
        );
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

        <h1>{isAdminPortal ? "Admin Portal" : "Member Portal"}</h1>

        <p className="auth-subtitle">
          {isAdminPortal
            ? "Administrator sign-in for the GAPS management dashboard."
            : "Sign in to access your GAPS member account."}
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email Address</label>

          <input
            id="login-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="login-password">Password</label>

          <input
            id="login-password"
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

        {isAdminPortal ? (
          <button
            className="auth-portal-switch"
            type="button"
            onClick={onSwitchPortal}
          >
            Member? Sign in to the Member Portal
          </button>
        ) : (
          <>
            <div className="auth-divider">
              <span>New to GAPS?</span>
            </div>

            <button
              className="secondary-auth-button"
              type="button"
              onClick={onRegister}
            >
              Apply for Membership
            </button>

            <p className="auth-note">
              Membership applications are subject to administrative review.
            </p>

            <button
              className="auth-portal-switch"
              type="button"
              onClick={onSwitchPortal}
            >
              Administrator? Sign in to the Admin Portal
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;