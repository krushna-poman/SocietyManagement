import { useEffect, useState } from "react";

import UserAccess from "./UserAccess";
import Project from "./Project";
import ManagerDashboard from "../manager/ManagerDashboard";

import propertiesUnitedLogo from "../assets/properties-united-logo.png";


// =====================================================
// PROJECT ICON
// =====================================================

function ProjectIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 70 70" fill="none">
      <rect
        x="7"
        y="10"
        width="56"
        height="50"
        rx="15"
        fill="#EAF0FF"
      />

      <path
        d="M18 27C18 23.686 20.686 21 24 21H31L36 26H47C50.314 26 53 28.686 53 32V47C53 50.314 50.314 53 47 53H24C20.686 53 18 50.314 18 47V27Z"
        fill="#2563EB"
      />

      <path
        d="M18 32H53"
        stroke="#93C5FD"
        strokeWidth="4"
      />

      <circle cx="28" cy="42" r="3" fill="white" />
      <circle cx="36" cy="42" r="3" fill="white" />
      <circle cx="44" cy="42" r="3" fill="white" />
    </svg>
  );
}


// =====================================================
// SETTINGS ICON
// =====================================================

function SettingsIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 70 70" fill="none">
      <rect
        x="7"
        y="7"
        width="56"
        height="56"
        rx="16"
        fill="#FFF2DF"
      />

      <path
        d="M35 20L38 23C39.4 23.2 40.8 23.8 42 24.5L46 23L50 27L48.5 31C49.2 32.2 49.8 33.6 50 35L53 38L50 42L46 41C44.8 41.8 43.4 42.3 42 42.5L39 46H34L31 42.5C29.6 42.3 28.2 41.8 27 41L23 42L20 38L23 35C23.2 33.6 23.8 32.2 24.5 31L23 27L27 23L31 24.5C32.2 23.8 33.6 23.2 35 23V20Z"
        fill="#F59E0B"
      />

      <circle
        cx="35"
        cy="34"
        r="8"
        fill="white"
      />

      <circle
        cx="35"
        cy="34"
        r="3.5"
        fill="#F59E0B"
      />
    </svg>
  );
}


// =====================================================
// CALENDAR ICON
// =====================================================

function CalendarIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 70 70" fill="none">
      <rect
        x="7"
        y="9"
        width="56"
        height="54"
        rx="15"
        fill="#E6FFFA"
      />

      <rect
        x="16"
        y="18"
        width="38"
        height="36"
        rx="7"
        fill="#14B8A6"
      />

      <rect
        x="16"
        y="18"
        width="38"
        height="10"
        rx="7"
        fill="#0F766E"
      />

      <rect
        x="24"
        y="13"
        width="5"
        height="12"
        rx="2.5"
        fill="#0F766E"
      />

      <rect
        x="41"
        y="13"
        width="5"
        height="12"
        rx="2.5"
        fill="#0F766E"
      />

      <circle cx="26" cy="36" r="2.5" fill="white" />
      <circle cx="35" cy="36" r="2.5" fill="white" />
      <circle cx="44" cy="36" r="2.5" fill="white" />

      <circle cx="26" cy="45" r="2.5" fill="white" />
      <circle cx="35" cy="45" r="2.5" fill="white" />
      <circle cx="44" cy="45" r="2.5" fill="white" />
    </svg>
  );
}


// =====================================================
// DASHBOARD
// =====================================================

function Dashboard({ role }) {

  const [activePage, setActivePage] =
    useState("dashboard");

  const [profileOpen, setProfileOpen] =
    useState(false);


  // =====================================================
  // PROJECTS
  // =====================================================

  const [projects, setProjects] = useState(() => {

    try {

      const savedProjects =
        localStorage.getItem("societyProjects");

      if (!savedProjects) {
        return [];
      }

      const parsedProjects =
        JSON.parse(savedProjects);

      return Array.isArray(parsedProjects)
        ? parsedProjects
        : [];

    } catch (error) {

      console.error(
        "Error loading projects:",
        error
      );

      return [];

    }

  });


  // =====================================================
  // SAVE PROJECTS
  // =====================================================

  useEffect(() => {

    try {

      localStorage.setItem(
        "societyProjects",
        JSON.stringify(projects)
      );

    } catch (error) {

      console.error(
        "Error saving projects:",
        error
      );

    }

  }, [projects]);


  // =====================================================
  // STORED USER
  // =====================================================

  let storedUser = null;

  try {

    storedUser =
      JSON.parse(
        sessionStorage.getItem("user") ||
        localStorage.getItem("user") ||
        "null"
      );

  } catch (error) {

    console.error(
      "Error loading user:",
      error
    );

  }


  const userName =
    storedUser?.name ||
    role ||
    "Admin";


  const userEmail =
    storedUser?.email ||
    "Administrator";


  // =====================================================
  // NAVIGATION
  // =====================================================

  const handleNavigation = (page) => {

    if (page === "logout") {

      sessionStorage.removeItem("user");
      localStorage.removeItem("user");

      window.location.href =
        "/user-login";

      return;
    }

    setProfileOpen(false);

    setActivePage(page);

  };


  // =====================================================
  // MANAGER DASHBOARD
  // =====================================================

  const isManagerDashboard =
    role === "Manager" ||
    role === "Project Manager";


  if (isManagerDashboard) {

    return (
      <ManagerDashboard
        role={role}
      />
    );

  }


  // =====================================================
  // APPLICATION CARD
  // =====================================================

  const ApplicationCard = ({
    title,
    icon,
    color,
    onClick,
  }) => {

    return (

      <button
        type="button"
        className="application-card"
        onClick={onClick}
        style={{
          "--card-color": color,
        }}
      >

        <div className="application-icon">
          {icon}
        </div>

        <div className="application-title">
          {title}
        </div>

      </button>

    );

  };


    // =====================================================
  // OPEN FULL PAGE
  // =====================================================

 if (activePage === "project") {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        minHeight: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        background:
          "linear-gradient(135deg, #f8f9ff 0%, #eef0fa 50%, #f8f9ff 100%)",
      }}
    >
      <Project
        projects={projects}
        setProjects={setProjects}
        onBack={() => setActivePage("dashboard")}
      />
    </div>
  );
}


  if (activePage === "settings") {
    return (
      <div
  style={{
    width: "100%",
    height: "100vh",
    minHeight: "100vh",
    overflowY: "auto",
    overflowX: "hidden",
    background:
      "linear-gradient(135deg, #f8f9ff 0%, #eef0fa 50%, #f8f9ff 100%)",
    padding: "40px",
  }}
>

        <button
          type="button"
          onClick={() => setActivePage("dashboard")}
          style={{
  border: "1px solid #d7dbea",
  background: "white",
  padding: "7px 14px",
  borderRadius: "8px",
  fontWeight: "600",
  fontSize: "13px",
  cursor: "pointer",
  boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
}}
        >
          ← Back to Dashboard
        </button>

        <div
          style={{
            maxWidth: "1100px",
            margin: "45px auto 0",
          }}
        >




          <div
            style={{
              marginTop: "35px",
              background: "white",
              borderRadius: "22px",
              padding: "35px",
              boxShadow: "0 12px 35px rgba(0,0,0,0.08)",
            }}
          >
            <h5 style={{ fontWeight: "800" }}>
              System Settings
            </h5>

            <h6 style={{ color: "#6b7280" }}>
              Manage users, permissions and application settings.
            </h6>

            <button
              type="button"
              onClick={() => setActivePage("user-access")}
              style={{
                marginTop: "20px",
                border: "none",
                background: "#2563eb",
                color: "white",
                padding: "13px 25px",
                borderRadius: "12px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              User Access
            </button>

          </div>

        </div>

      </div>
    );
  }


  if (activePage === "calendar") {
    return (
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #f8f9ff 0%, #eef0fa 50%, #f8f9ff 100%)",
          padding: "40px",
        }}
      >

        <button
          type="button"
          onClick={() => setActivePage("dashboard")}
          style={{
            border: "1px solid #d7dbea",
            background: "white",
            padding: "12px 22px",
            borderRadius: "12px",
            fontWeight: "600",
            fontSize: "16px",
            cursor: "pointer",
            boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
          }}
        >
          ← Back to Dashboard
        </button>

        <div
          style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >

          <div
            style={{
              background: "white",
              borderRadius: "25px",
              padding: "60px 100px",
              textAlign: "center",
              boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
            }}
          >

            <CalendarIcon />

            <h1
              style={{
                marginTop: "20px",
                fontWeight: "800",
                color: "#172033",
              }}
            >
              Calendar
            </h1>

            <p
              style={{
                color: "#6b7280",
                marginBottom: 0,
              }}
            >
              Society calendar and events
            </p>

          </div>

        </div>

      </div>
    );
  }


  // =====================================================
  // BACK BUTTON
  // =====================================================
const BackButton = ({
  target = "dashboard",
}) => {

  return (
    <button
  type="button"
  style={{
    position: "fixed",
    top: "15px",
    left: "15px",
    zIndex: 9999,

    border: "1px solid #d9deea",
    background: "white",
    padding: "7px 12px",
    borderRadius: "8px",
    color: "#394150",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(31,41,55,0.10)",
    whiteSpace: "nowrap",
  }}
  onClick={() =>
    setActivePage(target)
  }
>
  ← Back
</button>
  );

};


  // =====================================================
  // ADMIN DASHBOARD
  // =====================================================

  return (

    <div className="main-dashboard">


      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="background-circle circle-one" />

      <div className="background-circle circle-two" />

      <div className="background-circle circle-three" />


      {/* =================================================
          HEADER
      ================================================= */}
      {activePage !== "user-access" && (
      <header className="dashboard-topbar">


        {/* LOGO */}

        <div className="company-logo">

          <img
            src={propertiesUnitedLogo}
            alt="Properties United"
          />

        </div>


        {/* PROFILE */}

        <div className="profile-wrapper">

          <button
            type="button"
            className="profile-button"
            onClick={() =>
              setProfileOpen(!profileOpen)
            }
          >

            <span className="profile-avatar">
              {userName
                ?.charAt(0)
                ?.toUpperCase() || "A"}
            </span>

            <span className="profile-name">
              Profile
            </span>

            <span className="profile-arrow">
              {profileOpen ? "⌃" : "⌄"}
            </span>

          </button>


          {profileOpen && (

            <div className="profile-dropdown">

              <div className="profile-header">

                <div className="profile-big-avatar">

                  {userName
                    ?.charAt(0)
                    ?.toUpperCase() || "A"}

                </div>

                <div>

                  <div className="profile-user-name">
                    {userName}
                  </div>

                  <div className="profile-user-email">
                    {userEmail}
                  </div>

                </div>

              </div>


              <div className="profile-line" />


              <button
                type="button"
                className="profile-option"
              >
                👤 My Profile
              </button>


              <button
                type="button"
                className="profile-option logout-option"
                onClick={() =>
                  handleNavigation("logout")
                }
              >
                ↪ Logout
              </button>

            </div>

          )}

        </div>

      </header>
      )}


      {/* =================================================
          DASHBOARD HOME
      ================================================= */}

      {activePage === "dashboard" && (

        <main className="dashboard-home">

          <section className="applications-container">


            {/* PROJECT */}

            <ApplicationCard
              title="Project"
              icon={<ProjectIcon />}
              color="#2563EB"
              onClick={() =>
                handleNavigation("project")
              }
            />


            {/* SETTINGS */}

            <ApplicationCard
              title="Settings"
              icon={<SettingsIcon />}
              color="#F59E0B"
              onClick={() =>
                handleNavigation("settings")
              }
            />


            {/* CALENDAR */}

            <ApplicationCard
              title="Calendar"
              icon={<CalendarIcon />}
              color="#14B8A6"
              onClick={() =>
                handleNavigation("calendar")
              }
            />

          </section>

        </main>

      )}

      {/* =================================================
          USER ACCESS PAGE
      ================================================= */}

      {activePage === "user-access" && (

        <div className="inner-page">

          <BackButton target="settings" />

          <UserAccess />

        </div>

      )}


      {/* =================================================
          CSS
      ================================================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }


        /* ================================================
           MAIN BACKGROUND
        ================================================= */

        .main-dashboard {

          position: relative;

          min-height: 100vh;

          width: 100%;

          overflow-x: hidden;

          background:
            linear-gradient(
              135deg,
              #eef0fb 0%,
              #e7e9f6 45%,
              #f3f0fa 100%
            );

          color: #182033;
        }


        /* ================================================
           BACKGROUND CIRCLES
        ================================================= */

        .background-circle {

          position: absolute;

          border-radius: 50%;

          pointer-events: none;
        }


        .circle-one {

          width: 230px;

          height: 230px;

          left: -100px;

          top: 130px;

          background:
            rgba(90,111,240,0.08);
        }


        .circle-two {

          width: 200px;

          height: 200px;

          right: -70px;

          top: 230px;

          background:
            rgba(20,184,166,0.08);
        }


        .circle-three {

          width: 150px;

          height: 150px;

          right: 18%;

          bottom: 40px;

          background:
            rgba(245,158,11,0.06);
        }


        /* ================================================
           HEADER
        ================================================= */

        .dashboard-topbar {

          position: relative;

          z-index: 20;

          width: 100%;

          padding:
            18px
            clamp(15px, 4vw, 65px);

          display: flex;

          align-items: center;

          justify-content: space-between;
        }


        /* ================================================
           LOGO
        ================================================= */

        .company-logo {

          display: flex;

          align-items: center;

          margin-left: -12px;
        }


        .company-logo img {

          width: 175px;

          max-width: 100%;

          height: auto;

          object-fit: contain;
        }


        /* ================================================
           PROFILE
        ================================================= */

        .profile-wrapper {

          position: relative;

          margin-right: 30px;
        }


        .profile-button {

          display: flex;

          align-items: center;

          gap: 9px;

          border:
            1px solid
            rgba(255,255,255,0.9);

          background:
            rgba(255,255,255,0.85);

          backdrop-filter:
            blur(15px);

          padding:
            7px 13px 7px 7px;

          border-radius: 16px;

          box-shadow:
            0 8px 25px
            rgba(31,41,55,0.08);

          cursor: pointer;

          color: #303849;

          font-weight: 700;

          transition:
            all 0.25s ease;
        }


        .profile-button:hover {

          transform:
            translateY(-2px);

          box-shadow:
            0 12px 30px
            rgba(31,41,55,0.13);
        }


        .profile-avatar {

          width: 35px;

          height: 35px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 50%;

          color: white;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #7c3aed
            );

          font-size: 14px;

          font-weight: 800;
        }


        .profile-name {

          font-size: 14px;
        }


        .profile-arrow {

          font-size: 13px;

          color: #777f91;
        }


        /* ================================================
           PROFILE DROPDOWN
        ================================================= */

        .profile-dropdown {

          position: absolute;

          top: calc(100% + 12px);

          right: 0;

          width: 270px;

          padding: 15px;

          border-radius: 20px;

          background:
            rgba(255,255,255,0.97);

          backdrop-filter:
            blur(20px);

          box-shadow:
            0 20px 50px
            rgba(31,41,55,0.15);

          z-index: 100;
        }


        .profile-header {

          display: flex;

          align-items: center;

          gap: 12px;
        }


        .profile-big-avatar {

          width: 46px;

          height: 46px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 50%;

          color: white;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #7c3aed
            );

          font-weight: 800;
        }


        .profile-user-name {

          font-weight: 800;
        }


        .profile-user-email {

          margin-top: 3px;

          font-size: 12px;

          color: #7a8394;
        }


        .profile-line {

          height: 1px;

          margin: 14px 0;

          background: #edf0f5;
        }


        .profile-option {

          width: 100%;

          border: none;

          background: transparent;

          padding: 11px 10px;

          border-radius: 10px;

          text-align: left;

          cursor: pointer;

          font-weight: 600;

          color: #374151;
        }


        .profile-option:hover {

          background: #f3f5fa;
        }


        .logout-option {

          color: #dc2626;
        }


        /* ================================================
           DASHBOARD HOME
        ================================================= */

        .dashboard-home {

          position: relative;

          z-index: 2;

          min-height:
            calc(100vh - 80px);

          display: flex;

          align-items: flex-start;

          justify-content: center;

          padding:
            100px 30px 80px;
        }


        /* ================================================
           APPLICATIONS
        ================================================= */

        .applications-container {

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 28px;

          width: 100%;

          max-width: 650px;
        }


        /* ================================================
           APPLICATION CARD
        ================================================= */

        .application-card {

          position: relative;

          width: 170px;

          height: 170px;

          border:
            1px solid
            rgba(255,255,255,0.95);

          border-radius: 22px;

          background:
            rgba(255,255,255,0.88);

          backdrop-filter:
            blur(18px);

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: flex-start;

          cursor: pointer;

          padding-top: 22px;

          overflow: hidden;

          box-shadow:
            0 12px 30px
            rgba(31,41,55,0.10);

          transition:
            transform 0.28s ease,
            box-shadow 0.28s ease;
        }


        .application-card::before {

          content: "";

          position: absolute;

          width: 75px;

          height: 75px;

          top: -30px;

          right: -30px;

          border-radius: 50%;

          background:
            var(--card-color);

          opacity: 0.10;
        }


        .application-card:hover {

          transform:
            translateY(-8px)
            scale(1.03);

          box-shadow:
            0 22px 45px
            rgba(31,41,55,0.16);
        }


        /* ================================================
           ICON
        ================================================= */

        .application-icon {

          width: 76px;

          height: 76px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 20px;

          background:
            rgba(255,255,255,0.95);

          box-shadow:
            0 8px 20px
            rgba(31,41,55,0.08);

          margin-bottom: 12px;

          transform:
            translateY(-6px);

          transition:
            transform 0.28s ease;
        }


        .application-card:hover
        .application-icon {

          transform:
            translateY(-10px)
            scale(1.08);
        }


        /* ================================================
           TITLE
        ================================================= */

        .application-title {

          font-size: 17px;

          font-weight: 750;

          color: #202736;

          line-height: 1;

          margin-top: 1px;
        }


        /* ================================================
           INNER PAGES
        ================================================= */

        .inner-page {

          position: relative;

          z-index: 5;

          max-width: 1400px;

          margin: 0 auto;

          padding:
            15px
            clamp(15px, 3vw, 45px)
            50px;
        }


        /* ================================================
           BACK
        ================================================= */

        .back-button {

          border:
            1px solid #d9deea;

          background:
            rgba(255,255,255,0.88);

          padding:
            9px 16px;

          border-radius: 12px;

          color: #394150;

          font-weight: 700;

          cursor: pointer;

          margin-bottom: 20px;

          box-shadow:
            0 5px 15px
            rgba(31,41,55,0.06);

          transition:
            all 0.2s ease;
        }


        .back-button:hover {

          background: white;

          transform:
            translateX(-2px);
        }


        /* ================================================
           SETTINGS
        ================================================= */

        .settings-heading h1 {

          margin: 0;

          font-size: 40px;

          font-weight: 850;
        }


        .settings-heading p {

          color: #727b8e;

          margin-top: 6px;
        }


        .settings-grid {

          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(250px, 400px)
            );

          gap: 25px;

          margin-top: 30px;
        }


        .settings-card {

          min-height: 145px;

          display: flex;

          align-items: center;

          gap: 18px;

          padding: 25px;

          border:
            1px solid #e4e7ee;

          border-radius: 22px;

          background:
            rgba(255,255,255,0.88);

          box-shadow:
            0 10px 30px
            rgba(31,41,55,0.07);

          text-align: left;

          cursor: pointer;

          transition:
            all 0.25s ease;
        }


        .settings-card:hover {

          transform:
            translateY(-5px);

          box-shadow:
            0 18px 40px
            rgba(31,41,55,0.12);
        }


        .settings-card-icon {

          min-width: 58px;

          height: 58px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 17px;

          font-size: 25px;
        }


        .settings-card-icon.blue {

          background: #eaf1ff;
        }


        .settings-card-icon.orange {

          background: #fff2df;
        }


        .settings-card h3 {

          margin:
            0 0 6px;

          font-size: 19px;

          font-weight: 800;
        }


        .settings-card p {

          margin: 0;

          color: #737c8e;

          font-size: 13px;

          line-height: 1.5;
        }


        /* ================================================
           CALENDAR
        ================================================= */

        .calendar-page {

          min-height: 500px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          text-align: center;

          border-radius: 30px;

          background:
            rgba(255,255,255,0.55);
        }


        .calendar-big-icon {

          width: 100px;

          height: 100px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 25px;

          background: white;

          box-shadow:
            0 12px 30px
            rgba(31,41,55,0.10);
        }


        .calendar-page h1 {

          margin:
            18px 0 5px;

          font-size: 42px;

          font-weight: 850;
        }


        .calendar-page p {

          color: #727b8e;
        }


        /* ================================================
           RESPONSIVE
        ================================================= */

        @media (max-width: 800px) {

          .dashboard-topbar {

            padding:
              18px 25px;
          }


          .company-logo img {

            width: 165px;
          }


          .profile-wrapper {

            margin-right: 10px;
          }


          .applications-container {

            flex-wrap: wrap;

            gap: 20px;
          }


          .application-card {

            width: 160px;

            height: 160px;
          }

        }


        @media (max-width: 500px) {

          .dashboard-topbar {

            padding:
              15px 18px;
          }


          .company-logo {

            margin-left: 0;
          }


          .company-logo img {

            width: 145px;
          }


          .profile-wrapper {

            margin-right: 0;
          }


          .profile-name {

            display: none;
          }


          .application-card {

            width: 145px;

            height: 145px;

            padding-top: 18px;
          }


          .application-icon {

            width: 65px;

            height: 65px;
          }


          .application-title {

            font-size: 16px;
          }


          .settings-grid {

            grid-template-columns: 1fr;
          }

        }

      `}</style>

    </div>

  );

}





export default Dashboard;

