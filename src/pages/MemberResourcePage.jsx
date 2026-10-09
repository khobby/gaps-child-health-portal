import { useEffect, useState } from "react";
import "./MemberDashboard.css";
import "./MemberResourcePage.css";
import gapsLogo from "../assets/gaps-logo.png";
import { getImageUrl } from "../utils/imageUrl";

const API_URL = import.meta.env.VITE_API_URL;

function MemberResourcePage({
  type,
  member,
  onBack,
  onLogout
}) {
  const [events, setEvents] = useState([]);
  const [research, setResearch] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState(member || null);
  const [profileHeaderImageFailed, setProfileHeaderImageFailed] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const pages = {
    profile: {
      icon: "👤",
      title: "My Profile",
      description: "View and manage your professional information."
    },
    events: {
      icon: "📅",
      title: "GAPS Events",
      description:
        "Explore conferences, meetings and professional events."
    },
    research: {
      icon: "📚",
      title: "Research Library",
      description:
        "Explore research publications and academic resources."
    },
    news: {
      icon: "📰",
      title: "GAPS News",
      description:
        "Read announcements and updates from GAPS."
    },
    training: {
      icon: "🎓",
      title: "Training & Education",
      description:
        "Explore professional learning and educational opportunities."
    }
  };

  const currentPage = pages[type] || pages.profile;

  useEffect(() => {
    let cancelled = false;

    async function loadContent() {
      setLoading(true);
      setError("");

      if (type === "profile") {
        try {
          const token = localStorage.getItem("gapsToken");

          const response = await fetch(
            `${API_URL}/api/members/profile`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          if (!response.ok) {
            throw new Error("Unable to load your profile.");
          }

          const data = await response.json();

          if (!cancelled) {
            setProfile(data);

            localStorage.setItem(
              "gapsMember",
              JSON.stringify(data)
            );
          }
        } catch (err) {
          if (!cancelled) {
            setError(
              err.message || "Unable to load your profile."
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }

        return;
      }

      if (type === "training") {
        setLoading(false);
        return;
      }

      try {
        const [eventsResponse, researchResponse, newsResponse] =
          await Promise.all([
            fetch(`${API_URL}/api/events`),
            fetch(`${API_URL}/api/research`),
            fetch(`${API_URL}/api/news`)
          ]);

        if (eventsResponse.ok) {
          const data = await eventsResponse.json();
          if (!cancelled) {
            setEvents(Array.isArray(data) ? data : []);
          }
        }

        if (researchResponse.ok) {
          const data = await researchResponse.json();
          if (!cancelled) {
            setResearch(Array.isArray(data) ? data : []);
          }
        }

        if (newsResponse.ok) {
          const data = await newsResponse.json();
          if (!cancelled) {
            setNews(Array.isArray(data) ? data : []);
          }
        }
      } catch (err) {
        console.error("Failed to load member content:", err);
        if (!cancelled) {
          setError(
            err.message || "Something went wrong."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadContent();

    return () => {
      cancelled = true;
    };
  }, [type]);

  function handleImageSelect(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadMessage(
        "Please select a JPG, PNG or WEBP image."
      );

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadMessage(
        "Image must be smaller than 5MB."
      );

      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setUploadMessage("");
  }

  async function uploadProfileImage() {
    if (!selectedImage) {
      return;
    }

    try {
      setUploadingImage(true);
      setUploadMessage("");

      const token = localStorage.getItem("gapsToken");

      const formData = new FormData();

      formData.append("image", selectedImage);

      const response = await fetch(
        `${API_URL}/api/members/profile/image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to upload image."
        );
      }

      setProfile(data.member);
      setProfileHeaderImageFailed(false);

      localStorage.setItem(
        "gapsMember",
        JSON.stringify(data.member)
      );

      setSelectedImage(null);
      setImagePreview("");

      setUploadMessage(
        "Profile image updated successfully."
      );
    } catch (err) {
      setUploadMessage(
        err.message || "Failed to upload image."
      );
    } finally {
      setUploadingImage(false);
    }
  }

  function formatDate(value) {
    if (!value) {
      return "Date to be announced";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-GH", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  function getProfileImage() {
    if (imagePreview) {
      return imagePreview;
    }

    if (!profile?.profile_image_url) {
      return "";
    }

    return getImageUrl(profile.profile_image_url);
  }

  const memberFirstName =
    profile?.first_name ||
    profile?.firstName ||
    "";

  const memberLastName =
    profile?.last_name ||
    profile?.lastName ||
    "";

  const memberName =
    `${memberFirstName} ${memberLastName}`.trim() ||
    "GAPS Member";

  const headerMember = profile || member;
  const headerFirstName =
    headerMember?.first_name || headerMember?.firstName || "";
  const headerLastName =
    headerMember?.last_name || headerMember?.lastName || "";
  const headerImageUrl = getImageUrl(headerMember?.profile_image_url);

  const membershipStatus =
    profile?.membership_status ||
    profile?.membershipStatus ||
    "pending";

  return (
    <div className="member-resource-page">

      {/* HEADER */}
      <header className="member-header">
        <div className="member-brand">
          <img
            src={gapsLogo}
            alt="GAPS Logo"
            className="member-gaps-logo"
          />

          <div>
            <h1>Ghana Association of Paediatric Surgeons</h1>
            <p>Member Portal</p>
          </div>
        </div>

        <div className="member-account">
          <div className="member-account-info">
            <strong>
            {headerFirstName} {headerLastName}
            </strong>

            <span>
            {headerMember?.membership_status ||
              headerMember?.membershipStatus ||
              "Member"}
            </span>
          </div>

          <div className="member-profile-photo">
            {headerImageUrl && !profileHeaderImageFailed ? (
              <img
                src={headerImageUrl}
                alt={`${headerFirstName} ${headerLastName}`.trim()}
                onError={() => setProfileHeaderImageFailed(true)}
              />
            ) : (
              <div className="member-profile-placeholder">
                {(headerFirstName || "M")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
          </div>

          <button
            className="member-signout"
            onClick={onLogout}
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="resource-main">

        {/* PAGE TITLE */}
        <div className="resource-page-heading">

          <span className="resource-page-icon">
            {currentPage.icon}
          </span>

          <div>

            <span className="resource-eyebrow">
              GAPS MEMBER RESOURCES
            </span>

            <h1>
              {currentPage.title}
            </h1>

            <p>
              {currentPage.description}
            </p>

          </div>

        </div>

        {/* PROFILE */}
        {type === "profile" && (
          <>
            {loading ? (
              <section className="resource-panel">
                <p>Loading your profile...</p>
              </section>
            ) : error ? (
              <section className="resource-panel">
                <p className="resource-error">
                  {error}
                </p>
              </section>
            ) : (
              <section className="profile-card">

                <div className="profile-top">

                  <div className="profile-photo-section">

                    <div className="profile-photo">

                      {getProfileImage() ? (
                        <img
                          src={getProfileImage()}
                          alt={memberName}
                        />
                      ) : (
                        <div className="profile-photo-placeholder">
                          {memberFirstName
                            ? memberFirstName.charAt(0).toUpperCase()
                            : "M"}
                        </div>
                      )}

                    </div>

                    <label
                      className="profile-upload-button"
                      htmlFor="profile-image"
                    >
                      Change Profile Image
                    </label>

                    <input
                      id="profile-image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageSelect}
                      hidden
                    />

                    {selectedImage && (
                      <button
                        className="profile-save-button"
                        onClick={uploadProfileImage}
                        disabled={uploadingImage}
                      >
                        {uploadingImage
                          ? "Uploading..."
                          : "Save Image"}
                      </button>
                    )}

                    {uploadMessage && (
                      <p className="profile-upload-message">
                        {uploadMessage}
                      </p>
                    )}

                    <small className="profile-image-help">
                      JPG, PNG or WEBP · Maximum 5MB
                    </small>

                  </div>

                  <div className="profile-identity">

                    <img
                      src={gapsLogo}
                      alt="GAPS"
                      className="profile-gaps-logo"
                    />

                    <span className="profile-member-label">
                      GAPS MEMBER
                    </span>

                    <h2>
                      {memberName}
                    </h2>

                    <p>
                      {profile?.email ||
                        "Email not provided"}
                    </p>

                  </div>

                </div>

                <div className="profile-divider"></div>

                <div className="profile-details">

                  <div className="profile-detail">

                    <span>
                      FULL NAME
                    </span>

                    <strong>
                      {memberName}
                    </strong>

                  </div>

                  <div className="profile-detail">

                    <span>
                      EMAIL ADDRESS
                    </span>

                    <strong>
                      {profile?.email ||
                        "Not provided"}
                    </strong>

                  </div>

                  <div className="profile-detail">

                    <span>
                      SPECIALTY
                    </span>

                    <strong>
                      {profile?.specialty ||
                        "Not provided"}
                    </strong>

                  </div>

                  <div className="profile-detail">

                    <span>
                      MEMBERSHIP STATUS
                    </span>

                    <strong
                      className={`profile-status ${membershipStatus}`}
                    >
                      {membershipStatus
                        .charAt(0)
                        .toUpperCase() +
                        membershipStatus.slice(1)}
                    </strong>

                  </div>

                </div>

                <div className="profile-note">
                  Your specialty and professional information
                  are taken from your GAPS membership application.
                  Contact GAPS administration if any information
                  needs to be corrected.
                </div>

              </section>
            )}
          </>
        )}

        {/* EVENTS */}
        {type === "events" && (
          <section className="resource-panel">

            <h2>
              Events and Conferences
            </h2>

            {loading ? (
              <p>Loading events...</p>
            ) : error ? (
              <p className="resource-error">
                {error}
              </p>
            ) : events.length === 0 ? (
              <div className="resource-empty">

                <span>📅</span>

                <h3>
                  No events available yet
                </h3>

                <p>
                  GAPS meetings, conferences and
                  training events will appear here
                  when published.
                </p>

              </div>
            ) : (
              <div className="resource-item-list">

                {events.map((item) => (
                  <article
                    className="resource-item"
                    key={item.id}
                  >

                    {item.image_url && (
                      <img
                        src={getImageUrl(item.image_url)}
                        alt={item.title}
                        className="member-content-image"
                      />
                    )}

                    <div>

                      <span className="resource-item-label">
                        GAPS EVENT
                      </span>

                      <h3>
                        {item.title}
                      </h3>

                      <p>
                        {item.description ||
                          "Further event information will be provided."}
                      </p>

                      <div className="resource-item-meta">

                        <span>
                          📅{" "}
                          {formatDate(
                            item.event_date
                          )}
                        </span>

                        {item.location && (
                          <span>
                            📍 {item.location}
                          </span>
                        )}

                      </div>

                    </div>

                  </article>
                ))}

              </div>
            )}

          </section>
        )}

        {/* RESEARCH */}
        {type === "research" && (
          <section className="resource-panel">

            <h2>
              Research Publications
            </h2>

            {loading ? (
              <p>
                Loading research publications...
              </p>
            ) : error ? (
              <p className="resource-error">
                {error}
              </p>
            ) : research.length === 0 ? (
              <div className="resource-empty">

                <span>📚</span>

                <h3>
                  No publications available yet
                </h3>

                <p>
                  Research records published by GAPS
                  will appear here.
                </p>

              </div>
            ) : (
              <div className="resource-item-list">

                {research.map((item) => (
                  <article
                    className="resource-item"
                    key={item.id}
                  >

                    {item.image_url && (
                      <img
                        src={getImageUrl(item.image_url)}
                        alt={item.title}
                        className="member-content-image"
                      />
                    )}

                    <div>

                      <span className="resource-item-label">
                        RESEARCH PUBLICATION
                      </span>

                      <h3>
                        {item.title}
                      </h3>

                      {item.authors && (
                        <p>
                          <strong>
                            Authors:
                          </strong>{" "}
                          {item.authors}
                        </p>
                      )}

                      {item.journal && (
                        <p>
                          <strong>
                            Journal:
                          </strong>{" "}
                          {item.journal}
                        </p>
                      )}

                      {item.publication_year && (
                        <p>
                          <strong>
                            Year:
                          </strong>{" "}
                          {item.publication_year}
                        </p>
                      )}

                      {item.abstract && (
                        <p>
                          {item.abstract}
                        </p>
                      )}

                      {item.document_url && (
                        <a
                          className="resource-document-link"
                          href={item.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Publication →
                        </a>
                      )}

                    </div>

                  </article>
                ))}

              </div>
            )}

          </section>
        )}

        {/* NEWS */}
        {type === "news" && (
          <section className="resource-panel">

            <h2>
              News and Announcements
            </h2>

            {loading ? (
              <p>Loading news...</p>
            ) : error ? (
              <p className="resource-error">
                {error}
              </p>
            ) : news.length === 0 ? (
              <div className="resource-empty">

                <span>📰</span>

                <h3>
                  No news available yet
                </h3>

                <p>
                  GAPS announcements and updates will appear here
                  when published.
                </p>

              </div>
            ) : (
              <div className="resource-item-list">

                {news.map((article) => (
                  <article
                    className="resource-item"
                    key={article.id}
                  >

                    {article.image_url && (
                      <img
                        src={getImageUrl(article.image_url)}
                        alt={article.title}
                        className="member-content-image"
                      />
                    )}

                    <div>

                      <span className="resource-item-label">
                        GAPS NEWS
                      </span>

                      <h3>
                        {article.title}
                      </h3>

                      {article.published_at && (
                        <div className="resource-item-meta">
                          <span>
                            {formatDate(article.published_at)}
                          </span>
                        </div>
                      )}

                      <p>
                        {article.content}
                      </p>

                    </div>

                  </article>
                ))}

              </div>
            )}

          </section>
        )}

        {/* TRAINING */}
        {type === "training" && (
          <section className="resource-panel">

            <h2>
              Learning and Development
            </h2>

            <div className="training-resource-grid">

              <article>
                <span>01</span>

                <h3>
                  Training Programmes
                </h3>

                <p>
                  Information about professional
                  development programmes organised
                  by GAPS.
                </p>
              </article>

              <article>
                <span>02</span>

                <h3>
                  Workshops & Courses
                </h3>

                <p>
                  Updates on educational workshops
                  and learning opportunities.
                </p>
              </article>

              <article>
                <span>03</span>

                <h3>
                  Scientific Meetings
                </h3>

                <p>
                  Opportunities to share knowledge
                  and learn from colleagues.
                </p>
              </article>

              <article>
                <span>04</span>

                <h3>
                  Educational Resources
                </h3>

                <p>
                  Professional learning materials
                  and academic resources published
                  by GAPS.
                </p>
              </article>

            </div>

          </section>
        )}

        <button
          className="resource-bottom-back"
          onClick={onBack}
        >
          ← Return to Member Dashboard
        </button>

      </main>

      <footer className="resource-footer">
        Ghana Association of Paediatric Surgeons · Member Portal
      </footer>

    </div>
  );
}

export default MemberResourcePage;