import { useEffect, useState } from "react";
import "./AdminDashboard.css";

const API_URL = import.meta.env.VITE_API_URL;

function getImageUrl(imageUrl) {
  if (!imageUrl) {
    return "";
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  return `${API_URL}${imageUrl}`;
}

function AdminDashboard({ member, onLogout }) {
  const [section, setSection] = useState("overview");

  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [news, setNews] = useState([]);
  const [research, setResearch] = useState([]);
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showEventForm, setShowEventForm] = useState(false);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [showResearchForm, setShowResearchForm] = useState(false);

  const [eventImage, setEventImage] = useState(null);
  const [eventImagePreview, setEventImagePreview] = useState("");

  const [newsImage, setNewsImage] = useState(null);
  const [newsImagePreview, setNewsImagePreview] = useState("");

  const [researchImage, setResearchImage] = useState(null);
  const [researchImagePreview, setResearchImagePreview] = useState("");

  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    location: "",
    registrationRequired: false,
    imageUrl: ""
  });

  const [newsForm, setNewsForm] = useState({
    title: "",
    content: "",
    imageUrl: ""
  });

  const [researchForm, setResearchForm] = useState({
    title: "",
    authors: "",
    journal: "",
    publicationYear: "",
    abstract: "",
    documentUrl: "",
    imageUrl: ""
  });

  const token = localStorage.getItem("gapsToken");

  // --------------------------------------------------
  // API HELPER
  // --------------------------------------------------

  async function apiFetch(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {})
      }
    });

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error("Server returned an invalid response");
    }

    if (!response.ok) {
      throw new Error(
        data.message || `Request failed (${response.status})`
      );
    }

    return data;
  }

  // --------------------------------------------------
  // LOAD ADMIN DATA
  // --------------------------------------------------

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        membersData,
        eventsData,
        newsData,
        researchData,
        messagesData
      ] = await Promise.all([
        apiFetch("/api/members"),
        apiFetch("/api/events"),
        apiFetch("/api/news"),
        apiFetch("/api/research"),
        apiFetch("/api/contact")
      ]);

      setMembers(membersData);
      setEvents(eventsData);
      setNews(newsData);
      setResearch(researchData);
      setMessages(messagesData);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // --------------------------------------------------
  // GENERAL
  // --------------------------------------------------

  function clearMessages() {
    setMessage("");
    setError("");
  }

  // --------------------------------------------------
  // IMAGE UPLOAD
  // --------------------------------------------------

  async function uploadImage(file) {
    if (!file) {
      return "";
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif"
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        "Only JPG, PNG, WEBP and GIF image files are allowed."
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error(
        "Image is too large. Maximum allowed size is 5MB."
      );
    }

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_URL}/api/uploads`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error("Image upload returned an invalid response.");
    }

    if (!response.ok) {
      throw new Error(
        data.message || "Image upload failed."
      );
    }

    return data.imageUrl;
  }

  function validateImage(file) {
    if (!file) {
      return false;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif"
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only JPG, PNG, WEBP and GIF image files are allowed."
      );
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Image is too large. Maximum allowed size is 5MB."
      );
      return false;
    }

    return true;
  }

  // --------------------------------------------------
  // EVENT IMAGE
  // --------------------------------------------------

  function handleEventImageChange(e) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!validateImage(file)) {
      e.target.value = "";
      return;
    }

    setEventImage(file);

    const preview = URL.createObjectURL(file);
    setEventImagePreview(preview);
  }

  function removeEventImage() {
    setEventImage(null);
    setEventImagePreview("");

    setEventForm((previous) => ({
      ...previous,
      imageUrl: ""
    }));
  }

  // --------------------------------------------------
  // NEWS IMAGE
  // --------------------------------------------------

  function handleNewsImageChange(e) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!validateImage(file)) {
      e.target.value = "";
      return;
    }

    setNewsImage(file);

    const preview = URL.createObjectURL(file);
    setNewsImagePreview(preview);
  }

  function removeNewsImage() {
    setNewsImage(null);
    setNewsImagePreview("");

    setNewsForm((previous) => ({
      ...previous,
      imageUrl: ""
    }));
  }

  // --------------------------------------------------
  // RESEARCH IMAGE
  // --------------------------------------------------

  function handleResearchImageChange(e) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!validateImage(file)) {
      e.target.value = "";
      return;
    }

    setResearchImage(file);

    const preview = URL.createObjectURL(file);
    setResearchImagePreview(preview);
  }

  function removeResearchImage() {
    setResearchImage(null);
    setResearchImagePreview("");

    setResearchForm((previous) => ({
      ...previous,
      imageUrl: ""
    }));
  }

  // --------------------------------------------------
  // MEMBERS
  // --------------------------------------------------

  async function updateMemberStatus(id, status) {
    try {
      clearMessages();

      await apiFetch(`/api/members/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          membershipStatus: status
        })
      });

      setMessage(
        status === "approved"
          ? "Member approved successfully."
          : `Member status changed to ${status}.`
      );

      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  async function deleteMember(id) {
    if (
      !window.confirm(
        "Are you sure you want to delete this member?"
      )
    ) {
      return;
    }

    try {
      clearMessages();

      await apiFetch(`/api/members/${id}`, {
        method: "DELETE"
      });

      setMessage("Member deleted successfully.");

      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  // --------------------------------------------------
  // EVENTS
  // --------------------------------------------------

  function handleEventChange(e) {
    const {
      name,
      value,
      type,
      checked
    } = e.target;

    setEventForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value
    }));
  }

  async function createEvent(e) {
    e.preventDefault();

    try {
      clearMessages();
      setUploading(true);

      let imageUrl = eventForm.imageUrl;

      if (eventImage) {
        imageUrl = await uploadImage(eventImage);
      }

      await apiFetch("/api/events", {
        method: "POST",
        body: JSON.stringify({
          ...eventForm,
          imageUrl
        })
      });

      setMessage("Event created successfully.");

      setEventForm({
        title: "",
        description: "",
        eventDate: "",
        location: "",
        registrationRequired: false,
        imageUrl: ""
      });

      setEventImage(null);
      setEventImagePreview("");
      setShowEventForm(false);

      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function deleteEvent(id) {
    if (!window.confirm("Delete this event?")) {
      return;
    }

    try {
      clearMessages();

      await apiFetch(`/api/events/${id}`, {
        method: "DELETE"
      });

      setMessage("Event deleted successfully.");

      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  // --------------------------------------------------
  // NEWS
  // --------------------------------------------------

  function handleNewsChange(e) {
    const {
      name,
      value
    } = e.target;

    setNewsForm((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  async function createNews(e) {
    e.preventDefault();

    try {
      clearMessages();
      setUploading(true);

      let imageUrl = newsForm.imageUrl;

      if (newsImage) {
        imageUrl = await uploadImage(newsImage);
      }

      await apiFetch("/api/news", {
        method: "POST",
        body: JSON.stringify({
          ...newsForm,
          imageUrl
        })
      });

      setMessage(
        "News article published successfully."
      );

      setNewsForm({
        title: "",
        content: "",
        imageUrl: ""
      });

      setNewsImage(null);
      setNewsImagePreview("");
      setShowNewsForm(false);

      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function deleteNews(id) {
    if (
      !window.confirm(
        "Delete this news article?"
      )
    ) {
      return;
    }

    try {
      clearMessages();

      await apiFetch(`/api/news/${id}`, {
        method: "DELETE"
      });

      setMessage("News article deleted.");

      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  // --------------------------------------------------
  // RESEARCH
  // --------------------------------------------------

  function handleResearchChange(e) {
    const {
      name,
      value
    } = e.target;

    setResearchForm((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  async function createResearch(e) {
    e.preventDefault();

    try {
      clearMessages();
      setUploading(true);

      let imageUrl = researchForm.imageUrl;

      if (researchImage) {
        imageUrl = await uploadImage(researchImage);
      }

      await apiFetch("/api/research", {
        method: "POST",
        body: JSON.stringify({
          ...researchForm,
          imageUrl,
          publicationYear:
            researchForm.publicationYear
              ? Number(
                  researchForm.publicationYear
                )
              : null
        })
      });

      setMessage(
        "Research publication added successfully."
      );

      setResearchForm({
        title: "",
        authors: "",
        journal: "",
        publicationYear: "",
        abstract: "",
        documentUrl: "",
        imageUrl: ""
      });

      setResearchImage(null);
      setResearchImagePreview("");
      setShowResearchForm(false);

      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function deleteResearch(id) {
    if (
      !window.confirm(
        "Delete this research publication?"
      )
    ) {
      return;
    }

    try {
      clearMessages();

      await apiFetch(`/api/research/${id}`, {
        method: "DELETE"
      });

      setMessage(
        "Research publication deleted."
      );

      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  // --------------------------------------------------
  // CONTACT MESSAGES
  // --------------------------------------------------

  async function updateMessageStatus(
    id,
    status
  ) {
    try {
      clearMessages();

      await apiFetch(
        `/api/contact/${id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status })
        }
      );

      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  async function deleteMessage(id) {
    if (
      !window.confirm(
        "Delete this message?"
      )
    ) {
      return;
    }

    try {
      clearMessages();

      await apiFetch(
        `/api/contact/${id}`,
        {
          method: "DELETE"
        }
      );

      setMessage("Message deleted.");

      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }

  // --------------------------------------------------
  // COUNTS
  // --------------------------------------------------

  const pendingMembers = members.filter(
    (item) =>
      item.membership_status === "pending"
  );

  const unreadMessages = messages.filter(
    (item) =>
      item.status === "unread"
  );

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-logo">
            GAPS
          </div>

          <div>
            <strong>GAPS Admin</strong>
            <span>
              Administration Portal
            </span>
          </div>
        </div>

        <nav>
          <button
            className={
              section === "overview"
                ? "active"
                : ""
            }
            onClick={() =>
              setSection("overview")
            }
          >
            📊 Overview
          </button>

          <button
            className={
              section === "members"
                ? "active"
                : ""
            }
            onClick={() =>
              setSection("members")
            }
          >
            👥 Members
          </button>

          <button
            className={
              section === "events"
                ? "active"
                : ""
            }
            onClick={() =>
              setSection("events")
            }
          >
            📅 Events
          </button>

          <button
            className={
              section === "news"
                ? "active"
                : ""
            }
            onClick={() =>
              setSection("news")
            }
          >
            📰 News
          </button>

          <button
            className={
              section === "research"
                ? "active"
                : ""
            }
            onClick={() =>
              setSection("research")
            }
          >
            📚 Research
          </button>

          <button
            className={
              section === "messages"
                ? "active"
                : ""
            }
            onClick={() =>
              setSection("messages")
            }
          >
            ✉️ Messages
          </button>
        </nav>

        <button
          className="admin-logout"
          onClick={onLogout}
        >
          Sign Out
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <p>ADMINISTRATION</p>

            <h1>
              {section === "overview" &&
                "Dashboard Overview"}

              {section === "members" &&
                "Member Management"}

              {section === "events" &&
                "Event Management"}

              {section === "news" &&
                "News Management"}

              {section === "research" &&
                "Research Library"}

              {section === "messages" &&
                "Contact Messages"}
            </h1>
          </div>

          <div className="admin-user">
            <strong>
              {member?.firstName}{" "}
              {member?.lastName}
            </strong>

            <span>
              Administrator
            </span>
          </div>
        </header>

        {message && (
          <div className="admin-alert success-alert">
            <span>{message}</span>

            <button
              onClick={() =>
                setMessage("")
              }
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="admin-alert error-alert">
            <span>{error}</span>

            <button
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>
          </div>
        )}

        {loading && (
          <div className="admin-loading">
            Loading...
          </div>
        )}

        {/* ==================================================
            OVERVIEW
        ================================================== */}

        {section === "overview" && (
          <section className="admin-content">
            <div className="admin-stat-grid">
              <div className="admin-stat">
                <span>
                  Total Members
                </span>

                <strong>
                  {members.length}
                </strong>
              </div>

              <div className="admin-stat warning">
                <span>
                  Pending Applications
                </span>

                <strong>
                  {pendingMembers.length}
                </strong>
              </div>

              <div className="admin-stat">
                <span>Events</span>

                <strong>
                  {events.length}
                </strong>
              </div>

              <div className="admin-stat">
                <span>Research</span>

                <strong>
                  {research.length}
                </strong>
              </div>

              <div className="admin-stat">
                <span>
                  News Articles
                </span>

                <strong>
                  {news.length}
                </strong>
              </div>

              <div className="admin-stat warning">
                <span>
                  Unread Messages
                </span>

                <strong>
                  {unreadMessages.length}
                </strong>
              </div>
            </div>

            <div className="admin-panel">
              <h2>
                Pending Membership
                Applications
              </h2>

              {pendingMembers.length ===
              0 ? (
                <p>
                  No pending
                  applications.
                </p>
              ) : (
                <div className="admin-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Specialty</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {pendingMembers.map(
                        (item) => (
                          <tr
                            key={item.id}
                          >
                            <td>
                              {
                                item.first_name
                              }{" "}
                              {
                                item.last_name
                              }
                            </td>

                            <td>
                              {item.email}
                            </td>

                            <td>
                              {item.specialty ||
                                "Not specified"}
                            </td>

                            <td>
                              <button
                                className="approve-button"
                                onClick={() =>
                                  updateMemberStatus(
                                    item.id,
                                    "approved"
                                  )
                                }
                              >
                                ✓ Approve
                              </button>

                              <button
                                className="reject-button"
                                onClick={() =>
                                  updateMemberStatus(
                                    item.id,
                                    "rejected"
                                  )
                                }
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ==================================================
            MEMBERS
        ================================================== */}

        {section === "members" && (
          <section className="admin-content">
            <div className="admin-panel">
              <h2>All Members</h2>

              <div className="admin-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Specialty</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {members.map(
                      (item) => (
                        <tr
                          key={item.id}
                        >
                          <td>
                            {
                              item.first_name
                            }{" "}
                            {
                              item.last_name
                            }
                          </td>

                          <td>
                            {item.email}
                          </td>

                          <td>
                            {item.specialty ||
                              "—"}
                          </td>

                          <td>
                            {item.role}
                          </td>

                          <td>
                            <span className="status-badge">
                              {
                                item.membership_status
                              }
                            </span>
                          </td>

                          <td>
                            {item.role !==
                              "admin" && (
                              <>
                                <select
                                  value={
                                    item.membership_status
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updateMemberStatus(
                                      item.id,
                                      e
                                        .target
                                        .value
                                    )
                                  }
                                >
                                  <option value="pending">
                                    Pending
                                  </option>

                                  <option value="approved">
                                    Approved
                                  </option>

                                  <option value="rejected">
                                    Rejected
                                  </option>

                                  <option value="suspended">
                                    Suspended
                                  </option>
                                </select>

                                <button
                                  className="delete-button"
                                  onClick={() =>
                                    deleteMember(
                                      item.id
                                    )
                                  }
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ==================================================
            EVENTS
        ================================================== */}

        {section === "events" && (
          <section className="admin-content">
            <div className="admin-panel">
              <div className="panel-heading">
                <h2>Events</h2>

                <button
                  className="primary-admin-button"
                  onClick={() =>
                    setShowEventForm(
                      !showEventForm
                    )
                  }
                >
                  {showEventForm
                    ? "Cancel"
                    : "+ Add Event"}
                </button>
              </div>

              {showEventForm && (
                <form
                  className="admin-form"
                  onSubmit={createEvent}
                >
                  <h3>
                    Create New Event
                  </h3>

                  <label>
                    Event Title
                  </label>

                  <input
                    name="title"
                    value={
                      eventForm.title
                    }
                    onChange={
                      handleEventChange
                    }
                    placeholder="GAPS Annual Scientific Meeting"
                    required
                  />

                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      eventForm.description
                    }
                    onChange={
                      handleEventChange
                    }
                    placeholder="Event description..."
                    rows="4"
                  />

                  <div className="form-two-column">
                    <div>
                      <label>
                        Date & Time
                      </label>

                      <input
                        type="datetime-local"
                        name="eventDate"
                        value={
                          eventForm.eventDate
                        }
                        onChange={
                          handleEventChange
                        }
                        required
                      />
                    </div>

                    <div>
                      <label>
                        Location
                      </label>

                      <input
                        name="location"
                        value={
                          eventForm.location
                        }
                        onChange={
                          handleEventChange
                        }
                        placeholder="Accra, Ghana"
                      />
                    </div>
                  </div>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="registrationRequired"
                      checked={
                        eventForm.registrationRequired
                      }
                      onChange={
                        handleEventChange
                      }
                    />

                    Registration required
                  </label>

                  <div className="upload-section">
                    <label>
                      Event Image
                    </label>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={
                        handleEventImageChange
                      }
                    />

                    <small>
                      JPG, PNG, WEBP or GIF.
                      Maximum 5MB.
                    </small>

                    {eventImagePreview && (
                      <div className="image-preview">
                        <img
                          src={
                            eventImagePreview
                          }
                          alt="Event preview"
                        />

                        <button
                          type="button"
                          className="remove-image-button"
                          onClick={
                            removeEventImage
                          }
                        >
                          Remove Image
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="save-admin-button"
                    disabled={uploading}
                  >
                    {uploading
                      ? "Uploading..."
                      : "Publish Event"}
                  </button>
                </form>
              )}

              <div className="admin-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Date</th>
                      <th>Location</th>
                      <th>Registration</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {events.length ===
                    0 ? (
                      <tr>
                        <td colSpan="6">
                          No events have
                          been added yet.
                        </td>
                      </tr>
                    ) : (
                      events.map(
                        (item) => (
                          <tr
                            key={item.id}
                          >
                            <td>
                              {item.image_url ? (
                                <img
                                  className="admin-thumb"
                                  src={getImageUrl(
                                    item.image_url
                                  )}
                                  alt=""
                                />
                              ) : (
                                "—"
                              )}
                            </td>

                            <td>
                              {item.title}
                            </td>

                            <td>
                              {new Date(
                                item.event_date
                              ).toLocaleString()}
                            </td>

                            <td>
                              {item.location ||
                                "—"}
                            </td>

                            <td>
                              {item.registration_required
                                ? "Required"
                                : "Not required"}
                            </td>

                            <td>
                              <button
                                className="delete-button"
                                onClick={() =>
                                  deleteEvent(
                                    item.id
                                  )
                                }
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ==================================================
            NEWS
        ================================================== */}

        {section === "news" && (
          <section className="admin-content">
            <div className="admin-panel">
              <div className="panel-heading">
                <h2>
                  News Articles
                </h2>

                <button
                  className="primary-admin-button"
                  onClick={() =>
                    setShowNewsForm(
                      !showNewsForm
                    )
                  }
                >
                  {showNewsForm
                    ? "Cancel"
                    : "+ Add News"}
                </button>
              </div>

              {showNewsForm && (
                <form
                  className="admin-form"
                  onSubmit={createNews}
                >
                  <h3>
                    Publish News Article
                  </h3>

                  <label>Title</label>

                  <input
                    name="title"
                    value={
                      newsForm.title
                    }
                    onChange={
                      handleNewsChange
                    }
                    placeholder="GAPS announces annual scientific meeting"
                    required
                  />

                  <label>
                    Content
                  </label>

                  <textarea
                    name="content"
                    value={
                      newsForm.content
                    }
                    onChange={
                      handleNewsChange
                    }
                    placeholder="Write the news article..."
                    rows="8"
                    required
                  />

                  <div className="upload-section">
                    <label>
                      News Image
                    </label>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={
                        handleNewsImageChange
                      }
                    />

                    <small>
                      JPG, PNG, WEBP or GIF.
                      Maximum 5MB.
                    </small>

                    {newsImagePreview && (
                      <div className="image-preview">
                        <img
                          src={
                            newsImagePreview
                          }
                          alt="News preview"
                        />

                        <button
                          type="button"
                          className="remove-image-button"
                          onClick={
                            removeNewsImage
                          }
                        >
                          Remove Image
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="save-admin-button"
                    disabled={uploading}
                  >
                    {uploading
                      ? "Uploading..."
                      : "Publish News"}
                  </button>
                </form>
              )}

              <div className="admin-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Published</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {news.length ===
                    0 ? (
                      <tr>
                        <td colSpan="4">
                          No news articles
                          have been
                          published.
                        </td>
                      </tr>
                    ) : (
                      news.map(
                        (item) => (
                          <tr
                            key={item.id}
                          >
                            <td>
                              {item.image_url ? (
                                <img
                                  className="admin-thumb"
                                  src={getImageUrl(
                                    item.image_url
                                  )}
                                  alt=""
                                />
                              ) : (
                                "—"
                              )}
                            </td>

                            <td>
                              {item.title}
                            </td>

                            <td>
                              {new Date(
                                item.published_at
                              ).toLocaleDateString()}
                            </td>

                            <td>
                              <button
                                className="delete-button"
                                onClick={() =>
                                  deleteNews(
                                    item.id
                                  )
                                }
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ==================================================
            RESEARCH
        ================================================== */}

        {section === "research" && (
          <section className="admin-content">
            <div className="admin-panel">
              <div className="panel-heading">
                <h2>
                  Research Publications
                </h2>

                <button
                  className="primary-admin-button"
                  onClick={() =>
                    setShowResearchForm(
                      !showResearchForm
                    )
                  }
                >
                  {showResearchForm
                    ? "Cancel"
                    : "+ Add Publication"}
                </button>
              </div>

              {showResearchForm && (
                <form
                  className="admin-form"
                  onSubmit={
                    createResearch
                  }
                >
                  <h3>
                    Add Research
                    Publication
                  </h3>

                  <label>Title</label>

                  <input
                    name="title"
                    value={
                      researchForm.title
                    }
                    onChange={
                      handleResearchChange
                    }
                    placeholder="Research publication title"
                    required
                  />

                  <label>
                    Authors
                  </label>

                  <input
                    name="authors"
                    value={
                      researchForm.authors
                    }
                    onChange={
                      handleResearchChange
                    }
                    placeholder="Author names"
                  />

                  <div className="form-two-column">
                    <div>
                      <label>
                        Journal
                      </label>

                      <input
                        name="journal"
                        value={
                          researchForm.journal
                        }
                        onChange={
                          handleResearchChange
                        }
                        placeholder="Journal name"
                      />
                    </div>

                    <div>
                      <label>
                        Publication Year
                      </label>

                      <input
                        type="number"
                        name="publicationYear"
                        value={
                          researchForm.publicationYear
                        }
                        onChange={
                          handleResearchChange
                        }
                        placeholder="2026"
                        min="1900"
                        max="2100"
                      />
                    </div>
                  </div>

                  <label>
                    Abstract
                  </label>

                  <textarea
                    name="abstract"
                    value={
                      researchForm.abstract
                    }
                    onChange={
                      handleResearchChange
                    }
                    placeholder="Research abstract..."
                    rows="7"
                  />

                  <label>
                    Document URL
                  </label>

                  <input
                    name="documentUrl"
                    value={
                      researchForm.documentUrl
                    }
                    onChange={
                      handleResearchChange
                    }
                    placeholder="https://..."
                  />

                  <div className="upload-section">
                    <label>
                      Research Image
                    </label>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={
                        handleResearchImageChange
                      }
                    />

                    <small>
                      JPG, PNG, WEBP or GIF.
                      Maximum 5MB.
                    </small>

                    {researchImagePreview && (
                      <div className="image-preview">
                        <img
                          src={
                            researchImagePreview
                          }
                          alt="Research preview"
                        />

                        <button
                          type="button"
                          className="remove-image-button"
                          onClick={
                            removeResearchImage
                          }
                        >
                          Remove Image
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="save-admin-button"
                    disabled={uploading}
                  >
                    {uploading
                      ? "Uploading..."
                      : "Add Publication"}
                  </button>
                </form>
              )}

              <div className="admin-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Authors</th>
                      <th>Journal</th>
                      <th>Year</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {research.length ===
                    0 ? (
                      <tr>
                        <td colSpan="6">
                          No research
                          publications
                          have been
                          added.
                        </td>
                      </tr>
                    ) : (
                      research.map(
                        (item) => (
                          <tr
                            key={item.id}
                          >
                            <td>
                              {item.image_url ? (
                                <img
                                  className="admin-thumb"
                                  src={getImageUrl(
                                    item.image_url
                                  )}
                                  alt=""
                                />
                              ) : (
                                "—"
                              )}
                            </td>

                            <td>
                              {item.title}
                            </td>

                            <td>
                              {item.authors ||
                                "—"}
                            </td>

                            <td>
                              {item.journal ||
                                "—"}
                            </td>

                            <td>
                              {item.publication_year ||
                                "—"}
                            </td>

                            <td>
                              <button
                                className="delete-button"
                                onClick={() =>
                                  deleteResearch(
                                    item.id
                                  )
                                }
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ==================================================
            CONTACT MESSAGES
        ================================================== */}

        {section === "messages" && (
          <section className="admin-content">
            <div className="admin-panel">
              <h2>
                Contact Messages
              </h2>

              <div className="message-list">
                {messages.length ===
                0 ? (
                  <p>
                    No contact
                    messages.
                  </p>
                ) : (
                  messages.map(
                    (item) => (
                      <article
                        className={`message-card ${item.status}`}
                        key={item.id}
                      >
                        <div>
                          <strong>
                            {item.name}
                          </strong>

                          <span>
                            {item.email}
                          </span>
                        </div>

                        <h3>
                          {item.subject ||
                            "General enquiry"}
                        </h3>

                        <p>
                          {item.message}
                        </p>

                        <div className="message-actions">
                          <button
                            onClick={() =>
                              updateMessageStatus(
                                item.id,
                                "read"
                              )
                            }
                          >
                            Mark Read
                          </button>

                          <button
                            onClick={() =>
                              updateMessageStatus(
                                item.id,
                                "replied"
                              )
                            }
                          >
                            Mark Replied
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              deleteMessage(
                                item.id
                              )
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    )
                  )
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;