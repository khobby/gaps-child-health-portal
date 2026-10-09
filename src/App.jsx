import { useEffect, useState } from "react";
import "./App.css";
import gapsLogo from "./assets/gaps-logo.png";

import Login from "./pages/Login";
import Register from "./pages/Register";
import MemberDashboard from "./pages/MemberDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MemberResourcePage from "./pages/MemberResourcePage";
import { getImageUrl } from "./utils/imageUrl";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [page, setPage] = useState(() => {
    return localStorage.getItem("gapsPage") || "home";
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [member, setMember] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [events, setEvents] = useState([]);
  const [news, setNews] = useState([]);
  const [research, setResearch] = useState([]);

  const [contentLoading, setContentLoading] = useState(true);
  const [contentLoadedAt, setContentLoadedAt] = useState(0);

  /* --------------------------------
     RESTORE MEMBER SESSION
  -------------------------------- */
  useEffect(() => {
    Promise.resolve().then(() => {
      const savedMember = localStorage.getItem("gapsMember");

      if (savedMember) {
        try {
          setMember(JSON.parse(savedMember));
        } catch {
          localStorage.removeItem("gapsMember");
          localStorage.removeItem("gapsPage");
          setPage("home");
        }
      }

      setAuthLoading(false);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("gapsPage", page);
  }, [page]);

  /* --------------------------------
     LOAD PUBLIC CONTENT
  -------------------------------- */
  useEffect(() => {
    if (page !== "home") {
      return;
    }

    async function loadPublicContent() {
      setContentLoading(true);

      try {
        const [eventsResponse, newsResponse, researchResponse] =
          await Promise.all([
            fetch(`${API_URL}/api/events`),
            fetch(`${API_URL}/api/news`),
            fetch(`${API_URL}/api/research`)
          ]);

        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setEvents(Array.isArray(eventsData) ? eventsData : []);
        } else {
          console.error("Failed to load events");
        }

        if (newsResponse.ok) {
          const newsData = await newsResponse.json();
          setNews(Array.isArray(newsData) ? newsData : []);
        } else {
          console.error("Failed to load news");
        }

        if (researchResponse.ok) {
          const researchData = await researchResponse.json();
          setResearch(Array.isArray(researchData) ? researchData : []);
        } else {
          console.error("Failed to load research");
        }
      } catch (error) {
        console.error("Unable to load public GAPS content:", error);
      } finally {
        setContentLoadedAt(Date.now());
        setContentLoading(false);
      }
    }

    loadPublicContent();
  }, [page]);

  const announcementWindow = 7 * 24 * 60 * 60 * 1000;
  const now = contentLoadedAt;
  const homepageAnnouncements = [
    ...events.map((event) => ({
      id: `event-${event.id}`,
      kind: "EVENT",
      title: event.title,
      description: event.description,
      imageUrl: event.image_url,
      publishedAt: event.created_at,
      date: event.event_date,
      location: event.location,
      sectionId: "events"
    })),
    ...news.map((article) => ({
      id: `news-${article.id}`,
      kind: "NEWS",
      title: article.title,
      description: article.content,
      imageUrl: article.image_url,
      publishedAt: article.published_at,
      sectionId: "news"
    }))
  ]
    .filter((announcement) => {
      const publishedAt = Date.parse(announcement.publishedAt);
      return (
        Number.isFinite(publishedAt) &&
        publishedAt <= now &&
        now - publishedAt < announcementWindow
      );
    })
    .sort(
      (first, second) =>
        Date.parse(second.publishedAt) - Date.parse(first.publishedAt)
    );

  /* --------------------------------
     REVEAL ANIMATIONS
  -------------------------------- */
  useEffect(() => {
    const revealElements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.12 }
    );

    revealElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [page, events, news, research]);

  /* --------------------------------
     AUTHENTICATION
  -------------------------------- */
  function handleLogin(memberData) {
    setMember(memberData);

    if (memberData.role === "admin") {
      setPage("admin");
    } else {
      setPage("dashboard");
    }
  }

  function handleLogout() {
    localStorage.removeItem("gapsToken");
    localStorage.removeItem("gapsMember");
    localStorage.removeItem("gapsPage");

    setMember(null);
    setPage("home");
  }

  /* --------------------------------
     NAVIGATION
  -------------------------------- */
  function closeMobileMenu() {
    setMobileOpen(false);
  }

  function openLogin() {
    setPage("login");
    closeMobileMenu();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function openAdminLogin() {
    setPage("admin-login");
    closeMobileMenu();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function openRegister() {
    setPage("register");
    closeMobileMenu();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function goHome() {
    setPage("home");
    closeMobileMenu();

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }, 50);
  }

  function scrollToSection(id) {
    closeMobileMenu();

    if (page !== "home") {
      setPage("home");

      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: "smooth"
        });
      }, 100);

      return;
    }

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth"
    });
  }

  function handleMemberNavigation(destination) {
    setPage(destination);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  /* --------------------------------
     FORMATTERS
  -------------------------------- */
  function formatEventDate(dateValue) {
    if (!dateValue) {
      return "Date to be announced";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-GH", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  function formatNewsDate(dateValue) {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("en-GH", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  if (authLoading) {
    return (
      <div className="app-loading">
        Loading GAPS Member Portal...
      </div>
    );
  }

  /* --------------------------------
     LOGIN PAGE
  -------------------------------- */
  if (page === "login") {
    return (
      <Login
        onLogin={handleLogin}
        onBack={goHome}
        onRegister={openRegister}
        onSwitchPortal={openAdminLogin}
      />
    );
  }

  if (page === "admin-login") {
    return (
      <Login
        portal="admin"
        onLogin={handleLogin}
        onBack={goHome}
        onSwitchPortal={openLogin}
      />
    );
  }

  /* --------------------------------
     REGISTER PAGE
  -------------------------------- */
  if (page === "register") {
    return (
      <Register
        onBack={goHome}
        onLogin={openLogin}
      />
    );
  }

  /* --------------------------------
     MEMBER RESOURCE PAGES
  -------------------------------- */
  if (
    member &&
    ["profile", "events", "research", "news", "training"].includes(page)
  ) {
    return (
      <MemberResourcePage
        type={page}
        member={member}
        onBack={() => setPage("dashboard")}
        onLogout={handleLogout}
      />
    );
  }

  /* --------------------------------
     MEMBER DASHBOARD
  -------------------------------- */
  if (page === "dashboard" && member) {
    return (
      <MemberDashboard
        member={member}
        onLogout={handleLogout}
        onNavigate={handleMemberNavigation}
      />
    );
  }

  /* --------------------------------
     ADMIN DASHBOARD
  -------------------------------- */
  if (page === "admin") {
    if (!member || member.role !== "admin") {
      return (
        <Login
          portal="admin"
          onLogin={handleLogin}
          onBack={goHome}
          onSwitchPortal={openLogin}
        />
      );
    }

    return (
      <AdminDashboard
        member={member}
        onLogout={handleLogout}
      />
    );
  }

  /* --------------------------------
     PUBLIC WEBSITE
  -------------------------------- */
  return (
    <div className="gaps-site">

      {/* TOP BAR */}
      <div className="topbar">
        <div className="container topbar-inner">
          <span>
            Ghana Association of Paediatric Surgeons
          </span>

          <div className="topbar-right">
            <span>Accra, Ghana</span>
            <span className="topbar-divider">|</span>
            <span>Professional Medical Association</span>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <header className="site-header">
        <div className="container nav-inner">

          <button
            className="brand"
            onClick={goHome}
            aria-label="Go to GAPS homepage"
          >
            <img
              src={gapsLogo}
              alt="Ghana Association of Paediatric Surgeons"
              className="brand-logo"
            />

            <div className="brand-text">
              <strong>GAPS</strong>
              <span>
                Ghana Association of Paediatric Surgeons
              </span>
            </div>
          </button>

          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav
            className={`main-nav ${mobileOpen ? "open" : ""}`}
          >
            <button onClick={goHome}>
              Home
            </button>

            <button onClick={() => scrollToSection("about")}>
              About GAPS
            </button>

            <button onClick={() => scrollToSection("membership")}>
              Membership
            </button>

            <button onClick={() => scrollToSection("surgery")}>
              Paediatric Surgery
            </button>

            <button onClick={() => scrollToSection("research")}>
              Research
            </button>

            <button onClick={() => scrollToSection("training")}>
              Training
            </button>

            <button onClick={() => scrollToSection("events")}>
              Events
            </button>

            <button onClick={() => scrollToSection("news")}>
              News
            </button>

            <button onClick={() => scrollToSection("contact")}>
              Contact
            </button>

            <button
              className="mobile-member-button"
              onClick={openLogin}
            >
              Member Portal
            </button>
          </nav>

          <button
            className="member-button"
            onClick={openLogin}
          >
            Member Portal
          </button>

          {member?.role === "admin" && (
            <button
              className="nav-admin-button"
              onClick={() => setPage("admin")}
            >
              Admin Dashboard
            </button>
          )}
        </div>
      </header>

      {/* HERO */}
      <main>

        {!contentLoading && homepageAnnouncements.length === 0 && (
          <section className="homepage-announcements-empty">
            <p>New GAPS events and news will appear here for seven days.</p>
          </section>
        )}

        {homepageAnnouncements.length > 0 && (
          <section
            className="homepage-announcements"
            aria-label="Recent announcements"
          >
            <div className="container">
              <div className="homepage-announcements-heading">
                <span>RECENT UPDATES</span>
                <h2>Latest from GAPS</h2>
                <p>New events and news are highlighted here for seven days.</p>
              </div>

              <div className="homepage-announcements-list">
                {homepageAnnouncements.map((announcement) => (
                  <article
                    className="homepage-announcement-card"
                    key={announcement.id}
                  >
                    {announcement.imageUrl && (
                      <img
                        className="homepage-announcement-image"
                        src={getImageUrl(announcement.imageUrl)}
                        alt=""
                        loading="lazy"
                      />
                    )}

                    <div className="homepage-announcement-content">
                      <span className="homepage-announcement-kind">
                        {announcement.kind}
                      </span>
                      <h3>{announcement.title}</h3>
                      {announcement.description && (
                        <p>{announcement.description}</p>
                      )}
                      {(announcement.date || announcement.location) && (
                        <p className="homepage-announcement-meta">
                          {announcement.date &&
                            formatEventDate(announcement.date)}
                          {announcement.date && announcement.location && " · "}
                          {announcement.location}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          scrollToSection(announcement.sectionId)
                        }
                      >
                        View {announcement.kind === "EVENT" ? "event" : "news"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="hero">
          <div className="hero-glow hero-glow-one"></div>
          <div className="hero-glow hero-glow-two"></div>

          <div className="container hero-grid">

            <div className="hero-content reveal">

              <div className="eyebrow">
                <span className="eyebrow-dot"></span>
                ADVANCING CHILDREN'S SURGICAL CARE
              </div>

              <h1>
                Advancing
                <span> Paediatric Surgical Care </span>
                in Ghana
              </h1>

              <p className="hero-description">
                Bringing together paediatric surgeons and healthcare
                professionals to improve surgical care, education,
                research and outcomes for children across Ghana.
              </p>

              <div className="hero-actions">

                <button
                  className="primary-button"
                  onClick={() => scrollToSection("about")}
                >
                  Learn About GAPS
                  <span>→</span>
                </button>

                <button
                  className="outline-button"
                  onClick={() => scrollToSection("surgery")}
                >
                  Patient & Family Resources
                </button>

              </div>

              <div className="hero-trust">

                <div className="trust-avatars">
                  <span>G</span>
                  <span>A</span>
                  <span>P</span>
                  <span>S</span>
                </div>

                <div>
                  <strong>
                    Professional medical community
                  </strong>

                  <small>
                    Connecting expertise for better child health
                  </small>
                </div>

              </div>
            </div>

            <div className="hero-visual reveal">

              <div className="hero-image-card">

                <div className="hero-image-overlay"></div>

                <div className="hero-image-content">

                  <div className="floating-badge badge-top">
                    <span>✦</span>
                    Quality Care
                  </div>

                  <div className="hero-medical-symbol">
                    <img
                      src={gapsLogo}
                      alt="GAPS logo"
                    />
                  </div>

                  <div className="hero-image-caption">
                    <span>GAPS</span>

                    <strong>
                      Supporting safer surgery for children
                    </strong>
                  </div>

                </div>
              </div>

              <div className="commitment-card">

                <div className="commitment-icon">
                  ♥
                </div>

                <div>
                  <span>OUR COMMITMENT</span>

                  <strong>
                    Better surgical care for every child
                  </strong>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* STATS */}
        <section className="stats-section">
          <div className="container stats-grid">

            <div className="stat-item reveal">
              <strong>01</strong>
              <span>
                Professional
                <br />
                Association
              </span>
            </div>

            <div className="stat-item reveal">
              <strong>02</strong>
              <span>
                Education &
                <br />
                Training
              </span>
            </div>

            <div className="stat-item reveal">
              <strong>03</strong>
              <span>
                Research &
                <br />
                Innovation
              </span>
            </div>

            <div className="stat-item reveal">
              <strong>04</strong>
              <span>
                Child Health
                <br />
                Advocacy
              </span>
            </div>

          </div>
        </section>

        {/* INTRODUCTION */}
        <section className="section intro-section">

          <div className="container intro-grid">

            <div className="section-heading reveal">

              <span className="section-kicker">
                WELCOME TO GAPS
              </span>

              <h2>
                Advancing paediatric
                <span> surgery in Ghana</span>
              </h2>

            </div>

            <div className="intro-copy reveal">

              <p>
                The Ghana Association of Paediatric Surgeons is a
                professional body committed to advancing the practice
                of paediatric surgery and improving surgical care for
                children in Ghana.
              </p>

              <p>
                Through collaboration, professional development,
                education, research and advocacy, GAPS supports
                healthcare professionals working to improve outcomes
                for children.
              </p>

              <button
                className="text-button"
                onClick={() => scrollToSection("about")}
              >
                Discover more about GAPS →
              </button>

            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section
          id="about"
          className="section about-section"
        >
          <div className="container">

            <div className="section-header center reveal">

              <span className="section-kicker">
                WHAT WE DO
              </span>

              <h2>
                Building a stronger future
                <span> for paediatric surgery</span>
              </h2>

              <p>
                GAPS brings together expertise, education and research
                to strengthen paediatric surgical practice in Ghana.
              </p>

            </div>

            <div className="feature-grid">

              <article className="feature-card reveal">

                <div className="feature-number">
                  01
                </div>

                <div className="feature-icon">
                  ◈
                </div>

                <h3>
                  Professional Development
                </h3>

                <p>
                  Supporting paediatric surgeons and healthcare
                  professionals through professional collaboration
                  and knowledge sharing.
                </p>

                <button onClick={openLogin}>
                  Member Resources →
                </button>

              </article>

              <article className="feature-card featured reveal">

                <div className="feature-number">
                  02
                </div>

                <div className="feature-icon">
                  🎓
                </div>

                <h3>
                  Education & Training
                </h3>

                <p>
                  Promoting continuous education, training programmes,
                  workshops and opportunities for professional growth.
                </p>

                <button
                  onClick={() => scrollToSection("training")}
                >
                  Explore Training →
                </button>

              </article>

              <article className="feature-card reveal">

                <div className="feature-number">
                  03
                </div>

                <div className="feature-icon">
                  ⌁
                </div>

                <h3>
                  Research & Innovation
                </h3>

                <p>
                  Encouraging research and evidence-based approaches
                  that contribute to better paediatric surgical care.
                </p>

                <button
                  onClick={() => scrollToSection("research")}
                >
                  Explore Research →
                </button>

              </article>

            </div>
          </div>
        </section>

        {/* SURGERY */}
        <section
          id="surgery"
          className="section surgery-section"
        >
          <div className="container">

            <div className="section-header reveal">

              <span className="section-kicker">
                PAEDIATRIC SURGERY
              </span>

              <h2>
                Understanding common
                <span> paediatric conditions</span>
              </h2>

              <p>
                Educational information about conditions that may
                require paediatric surgical assessment.
              </p>

            </div>

            <div className="condition-grid">

              <article className="condition-card reveal">

                <div className="condition-icon">
                  01
                </div>

                <h3>
                  Inguinal Hernia
                </h3>

                <p>
                  A common condition in children involving tissue
                  passing through a weakness in the abdominal wall.
                </p>

                <button>
                  Learn More →
                </button>

              </article>

              <article className="condition-card reveal">

                <div className="condition-icon">
                  02
                </div>

                <h3>
                  Undescended Testis
                </h3>

                <p>
                  A condition where one or both testes have not moved
                  into their usual position before birth.
                </p>

                <button>
                  Learn More →
                </button>

              </article>

              <article className="condition-card reveal">

                <div className="condition-icon">
                  03
                </div>

                <h3>
                  Hirschsprung Disease
                </h3>

                <p>
                  A condition affecting bowel movement that may
                  require specialist assessment and management.
                </p>

                <button>
                  Learn More →
                </button>

              </article>

              <article className="condition-card reveal">

                <div className="condition-icon">
                  04
                </div>

                <h3>
                  Intussusception
                </h3>

                <p>
                  A condition involving one part of the intestine
                  moving into another and requiring prompt medical
                  assessment.
                </p>

                <button>
                  Learn More →
                </button>

              </article>

            </div>

            <div className="medical-note reveal">

              <strong>
                Important:
              </strong>

              <span>
                This section provides general educational information
                and does not replace assessment or advice from a
                qualified healthcare professional.
              </span>

            </div>

          </div>
        </section>

        {/* MEMBERSHIP */}
        <section
          id="membership"
          className="section membership-section"
        >
          <div className="container">

            <div className="membership-layout">

              <div className="membership-intro reveal">

                <span className="section-kicker">
                  MEMBERSHIP
                </span>

                <h2>
                  Be part of the
                  <span> GAPS community</span>
                </h2>

                <p>
                  Join a professional community dedicated to advancing
                  paediatric surgical care, education and research in
                  Ghana.
                </p>

                <button
                  className="primary-button"
                  onClick={openRegister}
                >
                  Apply for Membership →
                </button>

              </div>

              <div className="membership-cards">

                <article className="membership-card reveal">

                  <span className="membership-tag">
                    01
                  </span>

                  <h3>
                    Professional
                  </h3>

                  <p>
                    For qualified professionals practising
                    paediatric surgery.
                  </p>

                  <button onClick={openRegister}>
                    Apply →
                  </button>

                </article>

                <article className="membership-card highlight reveal">

                  <span className="membership-tag">
                    02
                  </span>

                  <h3>
                    Trainee
                  </h3>

                  <p>
                    Supporting professionals undergoing relevant
                    specialist training.
                  </p>

                  <button onClick={openRegister}>
                    Apply →
                  </button>

                </article>

                <article className="membership-card reveal">

                  <span className="membership-tag">
                    03
                  </span>

                  <h3>
                    Associate
                  </h3>

                  <p>
                    For professionals interested in supporting the
                    objectives of the association.
                  </p>

                  <button onClick={openRegister}>
                    Apply →
                  </button>

                </article>

              </div>
            </div>
          </div>
        </section>

        {/* RESEARCH */}
        <section
          id="research"
          className="section research-section"
        >
          <div className="container">

            <div className="section-header center reveal">

              <span className="section-kicker">
                RESEARCH & PUBLICATIONS
              </span>

              <h2>
                Advancing knowledge through
                <span> research</span>
              </h2>

              <p>
                Explore research, clinical resources and academic
                materials relevant to paediatric surgery.
              </p>

            </div>

            {contentLoading ? (
              <div className="resource-grid">

                <article className="resource-card reveal">
                  <span className="resource-icon">
                    …
                  </span>

                  <span className="resource-label">
                    RESEARCH
                  </span>

                  <h3>
                    Loading research...
                  </h3>

                  <p>
                    Loading the latest research records from GAPS.
                  </p>
                </article>

              </div>
            ) : research.length === 0 ? (
              <div className="resource-grid">

                <article className="resource-card reveal">

                  <span className="resource-icon">
                    ▤
                  </span>

                  <span className="resource-label">
                    PUBLICATIONS
                  </span>

                  <h3>
                    Research Library
                  </h3>

                  <p>
                    GAPS research publications and academic resources
                    will appear here when they are published.
                  </p>

                  <button onClick={openLogin}>
                    Member Resources →
                  </button>

                </article>

              </div>
            ) : (
              <div className="resource-grid">

                {research.map((item) => (
                  <article
                    className="resource-card reveal"
                    key={item.id}
                  >

                    <span className="resource-icon">
                      ▤
                    </span>

                    <span className="resource-label">
                      RESEARCH
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

                    {item.document_url ? (
                      <a
                        href={item.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-button"
                      >
                        View Publication →
                      </a>
                    ) : (
                      <button onClick={openLogin}>
                        Member Resources →
                      </button>
                    )}

                  </article>
                ))}

              </div>
            )}

          </div>
        </section>

        {/* TRAINING */}
        <section
          id="training"
          className="section training-section"
        >
          <div className="container training-grid">

            <div className="training-content reveal">

              <span className="section-kicker">
                TRAINING & EDUCATION
              </span>

              <h2>
                Learning that strengthens
                <span> surgical care</span>
              </h2>

              <p>
                GAPS supports continuous professional development
                through training programmes, workshops, courses and
                educational resources.
              </p>

              <div className="training-list">

                <div>
                  <span>01</span>
                  <strong>
                    Training Programmes
                  </strong>
                </div>

                <div>
                  <span>02</span>
                  <strong>
                    Workshops & Courses
                  </strong>
                </div>

                <div>
                  <span>03</span>
                  <strong>
                    Fellowship Opportunities
                  </strong>
                </div>

                <div>
                  <span>04</span>
                  <strong>
                    Educational Resources
                  </strong>
                </div>

              </div>

              <button
                className="primary-button"
                onClick={openLogin}
              >
                Explore Training →
              </button>

            </div>

            <div className="training-panel reveal">

              <div className="training-panel-top">
                <span>GAPS</span>
                <span>EDUCATION</span>
              </div>

              <div className="training-symbol">
                🎓
              </div>

              <h3>
                Knowledge.
                <br />
                Skills.
                <br />
                Better Care.
              </h3>

              <p>
                Creating opportunities for professional learning
                and collaboration.
              </p>

            </div>

          </div>
        </section>

        {/* EVENTS */}
        <section
          id="events"
          className="section events-section"
        >
          <div className="container">

            <div className="section-header reveal">

              <span className="section-kicker">
                EVENTS
              </span>

              <h2>
                Connect. Learn.
                <span> Collaborate.</span>
              </h2>

              <p>
                Stay informed about GAPS meetings, scientific
                programmes and professional events.
              </p>

            </div>

            {contentLoading ? (
              <div className="event-feature reveal">

                <div className="event-date">
                  <span>GAPS</span>
                  <strong>...</strong>
                  <small>
                    LOADING EVENTS
                  </small>
                </div>

                <div className="event-info">

                  <span className="event-status">
                    PLEASE WAIT
                  </span>

                  <h3>
                    Loading GAPS events
                  </h3>

                  <p>
                    The latest events are being loaded.
                  </p>

                </div>

              </div>
            ) : events.length === 0 ? (
              <div className="event-feature reveal">

                <div className="event-date">
                  <span>GAPS</span>
                  <strong>ASM</strong>
                  <small>
                    ANNUAL SCIENTIFIC MEETING
                  </small>
                </div>

                <div className="event-info">

                  <span className="event-status">
                    EVENTS
                  </span>

                  <h3>
                    GAPS Events
                  </h3>

                  <p>
                    Upcoming GAPS meetings, scientific programmes
                    and professional events will appear here.
                  </p>

                  <div className="event-meta">
                    <span>
                      📅 Date to be announced
                    </span>

                    <span>
                      📍 Ghana
                    </span>
                  </div>

                </div>

                <button
                  className="event-button"
                  onClick={openLogin}
                >
                  Member Portal →
                </button>

              </div>
            ) : (
              <div className="events-list">

                {events.map((event, index) => (
                  <article
                    className="event-feature reveal"
                    key={event.id}
                  >

                    <div className="event-date">

                      <span>GAPS</span>

                      <strong>
                        {String(index + 1).padStart(2, "0")}
                      </strong>

                      <small>
                        EVENT
                      </small>

                    </div>

                    <div className="event-info">

                      <span className="event-status">
                        UPCOMING EVENT
                      </span>

                      <h3>
                        {event.title}
                      </h3>

                      {event.description && (
                        <p>
                          {event.description}
                        </p>
                      )}

                      <div className="event-meta">

                        <span>
                          📅{" "}
                          {formatEventDate(event.event_date)}
                        </span>

                        {event.location && (
                          <span>
                            📍 {event.location}
                          </span>
                        )}

                      </div>

                    </div>

                    <button
                      className="event-button"
                      onClick={openLogin}
                    >
                      Member Portal →
                    </button>

                  </article>
                ))}

              </div>
            )}

          </div>
        </section>

        {/* NEWS */}
        <section
          id="news"
          className="section news-section"
        >
          <div className="container">

            <div className="section-header center reveal">

              <span className="section-kicker">
                NEWS & ANNOUNCEMENTS
              </span>

              <h2>
                What's happening at
                <span> GAPS</span>
              </h2>

            </div>

            {contentLoading ? (
              <div className="news-grid">

                <article className="news-card featured reveal">

                  <div className="news-image">
                    <span>GAPS</span>
                  </div>

                  <div className="news-content">

                    <span>
                      NEWS
                    </span>

                    <h3>
                      Loading GAPS news...
                    </h3>

                    <p>
                      Loading the latest announcements.
                    </p>

                  </div>

                </article>

              </div>
            ) : news.length === 0 ? (
              <div className="news-grid">

                <article className="news-card featured reveal">

                  <div className="news-image">
                    <span>GAPS</span>
                  </div>

                  <div className="news-content">

                    <span>
                      ANNOUNCEMENTS
                    </span>

                    <h3>
                      GAPS News & Announcements
                    </h3>

                    <p>
                      News, announcements and activities from the
                      Ghana Association of Paediatric Surgeons will
                      appear here.
                    </p>

                    <button onClick={openLogin}>
                      Member Updates →
                    </button>

                  </div>

                </article>

              </div>
            ) : (
              <div className="news-grid">

                {news.map((item, index) => (
                  <article
                    className={`news-card ${
                      index === 0 ? "featured" : ""
                    } reveal`}
                    key={item.id}
                  >

                    {index === 0 && (
                      <div className="news-image">

                        {item.image_url ? (
                          <img
                            src={getImageUrl(item.image_url)}
                            alt={item.title}
                          />
                        ) : (
                          <span>
                            GAPS
                          </span>
                        )}

                      </div>
                    )}

                    <div className="news-content">

                      <span>
                        ANNOUNCEMENT
                      </span>

                      <h3>
                        {item.title}
                      </h3>

                      {item.published_at && (
                        <small>
                          {formatNewsDate(item.published_at)}
                        </small>
                      )}

                      <p>
                        {item.content}
                      </p>

                    </div>

                  </article>
                ))}

              </div>
            )}

          </div>
        </section>

        {/* CONTACT CTA */}
        <section
          id="contact"
          className="contact-section"
        >
          <div className="container contact-box reveal">

            <div>

              <span className="section-kicker">
                GET IN TOUCH
              </span>

              <h2>
                Let's advance paediatric
                <span> surgical care together.</span>
              </h2>

              <p>
                For professional enquiries, collaboration,
                education and association information, contact GAPS.
              </p>

            </div>

            <div className="contact-details">

              <a href="mailto:info@gapsghana.org">
                <span>EMAIL</span>
                info@gapsghana.org
              </a>

              <div>
                <span>LOCATION</span>
                Accra, Ghana
              </div>

            </div>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="site-footer">

        <div className="container footer-grid">

          <div className="footer-brand">

            <img
              src={gapsLogo}
              alt="GAPS"
            />

            <p>
              Ghana Association of Paediatric Surgeons
            </p>

            <span>
              Advancing paediatric surgical care through
              collaboration, education and research.
            </span>

          </div>

          <div className="footer-column">

            <h4>
              QUICK LINKS
            </h4>

            <button onClick={goHome}>
              Home
            </button>

            <button
              onClick={() => scrollToSection("about")}
            >
              About GAPS
            </button>

            <button
              onClick={() => scrollToSection("membership")}
            >
              Membership
            </button>

            <button
              onClick={() => scrollToSection("events")}
            >
              Events
            </button>

          </div>

          <div className="footer-column">

            <h4>
              RESOURCES
            </h4>

            <button
              onClick={() => scrollToSection("surgery")}
            >
              Paediatric Surgery
            </button>

            <button
              onClick={() => scrollToSection("research")}
            >
              Research
            </button>

            <button
              onClick={() => scrollToSection("training")}
            >
              Training
            </button>

            <button onClick={openLogin}>
              Member Portal
            </button>

          </div>

          <div className="footer-column">

            <h4>
              CONTACT
            </h4>

            <span>
              Accra, Ghana
            </span>

            <a href="mailto:info@gapsghana.org">
              info@gapsghana.org
            </a>

            <button
              className="footer-apply"
              onClick={openRegister}
            >
              Apply for Membership →
            </button>

          </div>

        </div>

        <div className="container footer-bottom">

          <span>
            Original website code and design © {new Date().getFullYear()}{" "}
            Quarchey Nii Otto Isaac.
          </span>

          <span>
            GAPS name, logo and third-party materials belong to their
            respective owners.
          </span>

        </div>

      </footer>

    </div>
  );
}

export default App;