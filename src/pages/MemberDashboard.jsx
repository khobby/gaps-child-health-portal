import { useEffect, useState } from "react";
import "./MemberDashboard.css";

const API_URL = import.meta.env.VITE_API_URL;

function MemberDashboard({ member, onLogout, onNavigate }) {
  const [profile, setProfile] = useState(member);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("gapsToken");

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/members/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load member profile."
        );
      }

      setProfile(data);

      // Keep localStorage synchronized with the
      // latest membership status from PostgreSQL.
      localStorage.setItem(
        "gapsMember",
        JSON.stringify(data)
      );
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  const membershipStatus =
    profile?.membership_status ||
    profile?.membershipStatus ||
    "pending";

  const isApproved =
    membershipStatus === "approved";

  const isRejected =
    membershipStatus === "rejected";

  const isSuspended =
    membershipStatus === "suspended";

  const isPending =
    membershipStatus === "pending";

  function goTo(page) {
    if (onNavigate) {
      onNavigate(page);
    }
  }

  if (loading) {
    return (
      <div className="member-dashboard-page">
        <div className="member-loading">
          Loading your member dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="member-dashboard-page">
      <header className="member-dashboard-header">
        <div>
          <span className="member-dashboard-label">
            GAPS MEMBER PORTAL
          </span>

          <h1>
            Welcome, {profile?.first_name || profile?.firstName}{" "}
            {profile?.last_name || profile?.lastName}
          </h1>

          <p>
            Access your professional membership,
            events, research and training resources.
          </p>
        </div>

        <button
          className="member-signout-button"
          onClick={onLogout}
        >
          Sign Out
        </button>
      </header>

      <main className="member-dashboard-content">
        {error && (
          <div className="member-alert member-error">
            {error}
          </div>
        )}

        {/* ==================================================
            MEMBERSHIP STATUS
        ================================================== */}

        {isPending && (
          <section className="membership-review-card">
            <div className="membership-review-icon">
              ⏳
            </div>

            <div>
              <span className="membership-status-label">
                MEMBERSHIP REVIEW
              </span>

              <h2>
                Your application is under review
              </h2>

              <p>
                Your membership application is currently
                being processed. GAPS administration will
                update your membership status after review.
              </p>
            </div>
          </section>
        )}

        {isApproved && (
          <section className="membership-approved-card">
            <div className="membership-approved-icon">
              ✓
            </div>

            <div>
              <span className="membership-status-label">
                MEMBERSHIP APPROVED
              </span>

              <h2>
                Your GAPS membership is approved
              </h2>

              <p>
                Your membership application has been
                approved. You can now access the available
                member resources.
              </p>
            </div>
          </section>
        )}

        {isRejected && (
          <section className="membership-rejected-card">
            <div className="membership-rejected-icon">
              !
            </div>

            <div>
              <span className="membership-status-label">
                MEMBERSHIP STATUS
              </span>

              <h2>
                Membership application not approved
              </h2>

              <p>
                Your membership application was not approved
                at this time. Please contact GAPS administration
                if you require further information.
              </p>
            </div>
          </section>
        )}

        {isSuspended && (
          <section className="membership-rejected-card">
            <div className="membership-rejected-icon">
              !
            </div>

            <div>
              <span className="membership-status-label">
                MEMBERSHIP STATUS
              </span>

              <h2>
                Membership currently suspended
              </h2>

              <p>
                Your membership is currently suspended.
                Please contact GAPS administration for
                further information.
              </p>
            </div>
          </section>
        )}

        {/* ==================================================
            MEMBER RESOURCE CARDS
        ================================================== */}

        <section className="member-resource-grid">

          {/* PROFILE */}

          <article className="member-resource-card">
            <div className="member-resource-icon">
              👤
            </div>

            <div className="member-resource-content">
              <h2>
                My Profile
              </h2>

              <p>
                View and manage your professional information.
              </p>

              <button
                className="member-resource-button"
                onClick={() =>
                  goTo("profile")
                }
              >
                View Profile
              </button>
            </div>
          </article>

          {/* EVENTS */}

          <article className="member-resource-card">
            <div className="member-resource-icon">
              📅
            </div>

            <div className="member-resource-content">
              <h2>
                Events
              </h2>

              <p>
                View upcoming GAPS conferences, meetings and
                training events.
              </p>

              <button
                className="member-resource-button"
                onClick={() =>
                  goTo("events")
                }
              >
                View Events
              </button>
            </div>
          </article>

          {/* RESEARCH */}

          <article className="member-resource-card">
            <div className="member-resource-icon">
              📚
            </div>

            <div className="member-resource-content">
              <h2>
                Research Library
              </h2>

              <p>
                Access research publications and professional
                resources.
              </p>

              <button
                className="member-resource-button"
                onClick={() =>
                  goTo("research")
                }
              >
                Open Library
              </button>
            </div>
          </article>

          {/* NEWS */}

          <button
            className="member-resource-card"
            onClick={() => onNavigate("news")}
          >
            <div className="resource-icon">
              📰
            </div>

            <div>
              <h3>News & Updates</h3>

              <p>
                Read the latest GAPS announcements, activities
                and professional updates.
              </p>
            </div>
          </button>

          {/* TRAINING */}

          <article className="member-resource-card">
            <div className="member-resource-icon">
              🎓
            </div>

            <div className="member-resource-content">
              <h2>
                Training & Education
              </h2>

              <p>
                Explore educational programmes and learning
                resources.
              </p>

              <button
                className="member-resource-button"
                onClick={() =>
                  goTo("training")
                }
              >
                View Training
              </button>
            </div>
          </article>

        </section>

        {/* ==================================================
            MEMBER INFORMATION
        ================================================== */}

        <section className="member-information-panel">
          <div>
            <span>
              MEMBERSHIP STATUS
            </span>

            <strong
              className={`member-status ${membershipStatus}`}
            >
              {membershipStatus}
            </strong>
          </div>

          <div>
            <span>
              EMAIL
            </span>

            <strong>
              {profile?.email}
            </strong>
          </div>

          <div>
            <span>
              SPECIALTY
            </span>

            <strong>
              {profile?.specialty || "Not specified"}
            </strong>
          </div>
        </section>
      </main>
    </div>
  );
}

export default MemberDashboard;