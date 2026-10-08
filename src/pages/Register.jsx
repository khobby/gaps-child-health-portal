import { useState } from "react";
import "./Auth.css";

const API_URL = import.meta.env.VITE_API_URL;

function Register({ onBack, onLogin }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    specialty: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      localStorage.setItem("gapsToken", data.token);
      localStorage.setItem("gapsMember", JSON.stringify(data.member));

      setSuccess(
        "Your membership application has been submitted successfully."
      );

      setTimeout(() => {
        onLogin(data.member);
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card register-card">

        <button className="back-button" onClick={onBack}>
          ← Back to GAPS website
        </button>

        <div className="auth-logo">
          <div className="gaps-mark">GAPS</div>
        </div>

        <h1>Membership Application</h1>

        <p className="auth-subtitle">
          Apply to become a member of the Ghana Association of Paediatric
          Surgeons.
        </p>

        {error && <div className="auth-error">{error}</div>}

        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <label>First Name</label>

              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="First name"
                required
              />
            </div>

            <div>
              <label>Last Name</label>

              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last name"
                required
              />
            </div>
          </div>

          <label>Email Address</label>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="name@example.com"
            required
          />

          <label>Phone Number</label>

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone number"
          />

          <label>Professional Specialty</label>

          <input
            name="specialty"
            value={form.specialty}
            onChange={handleChange}
            placeholder="e.g. Paediatric Surgery"
          />

          <label>Password</label>

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a password"
            minLength="8"
            required
          />

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Membership Application"}
          </button>
        </form>

        <div className="auth-divider">
          <span>Already a member?</span>
        </div>

        <button className="secondary-auth-button" onClick={onLogin}>
          Sign In
        </button>

        <p className="auth-note">
          Applications are reviewed by the GAPS administration.
        </p>
      </div>
    </div>
  );
}

export default Register;