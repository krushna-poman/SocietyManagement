import { useEffect, useState } from "react";

import Reading from "./Reading";
import Punch from "./Punch";
import PunchOut from "./PunchOut";
import StaffAttendance from "./StaffAttendance";
import Task from "./Task";

function ManagerDashboard({ role }) {
  const [activePage, setActivePage] = useState("dashboard");

  const [assignedProjects, setAssignedProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);

  /* ================================================= */
  /* USER DATA */
  /* ================================================= */

  const storedUser = JSON.parse(
    sessionStorage.getItem("user") ||
    localStorage.getItem("user") ||
    "null"
  );

  const userName =
    storedUser?.name ||
    storedUser?.full_name ||
    storedUser?.fullName ||
    storedUser?.username ||
    "User";

  /* ================================================= */
  /* LOAD ASSIGNED PROJECTS */
  /* ================================================= */

  useEffect(() => {
    const loadAssignedProjects = async () => {
      const userId =
        storedUser?.id ||
        storedUser?.user_id;

        console.log("LOGIN USER:", storedUser);
console.log("LOGIN USER ID:", userId);

      if (!userId) {
        setProjectsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://${window.location.hostname}:5000/api/users/${userId}/projects`
        );

        const data = await response.json();

        if (
          response.ok &&
          data.success
        ) {
          const projects =
            data.projects || [];

          setAssignedProjects(projects);

          if (projects.length > 0) {
            setSelectedProject(
              projects[0]
            );
          }
        }
      } catch (error) {
        console.error(
          "Assigned Projects Error:",
          error
        );
      } finally {
        setProjectsLoading(false);
      }
    };

    loadAssignedProjects();
  }, []);

  /* ================================================= */
  /* LOGOUT */
  /* ================================================= */

  const handleLogout = () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");

    window.location.href =
      "/user-login";
  };

  /* ================================================= */
  /* SELECT PROJECT */
  /* ================================================= */

  const handleProjectChange = (e) => {
    const projectId =
      Number(e.target.value);

    const project =
      assignedProjects.find(
        (item) =>
          Number(item.id) ===
          projectId
      );

    setSelectedProject(
      project || null
    );
  };

  /* ================================================= */
  /* MAIN */
  /* ================================================= */

  return (
    <div className="manager-app">

      <main className="manager-content">

        {/* ================================================= */}
        {/* TOP HEADER */}
        {/* ================================================= */}
        {activePage === "dashboard" && (
          <div className="manager-top-header">

            {/* RIGHT */}
            <div className="header-right">

              {/* PROJECT SELECT */}
              <div className="project-select-box">

                <span className="project-small-label">
                  Project
                </span>

                <select
                  value={
                    selectedProject?.id || ""
                  }
                  onChange={
                    handleProjectChange
                  }
                >

                  {projectsLoading ? (

                    <option value="">
                      Loading...
                    </option>

                  ) : assignedProjects.length === 0 ? (

                    <option value="">
                      No Project Assigned
                    </option>

                  ) : (

                    assignedProjects.map(
                      (project) => (
                        <option
                          key={project.id}
                          value={project.id}
                        >
                          {project.name}
                        </option>
                      )
                    )

                  )}

                </select>

              </div>

              {/* PROFILE */}
              <div className="profile-wrapper">

                <button
                  type="button"
                  className="profile-button"
                  onClick={() =>
                    setProfileOpen(
                      !profileOpen
                    )
                  }
                >

                  <span className="profile-icon">
                    👤
                  </span>

                  <span className="profile-name">
                    {userName}
                  </span>

                  <span className="profile-arrow">
                    ▾
                  </span>

                </button>

                {profileOpen && (

                  <div className="profile-menu">

                    <div className="profile-menu-user">
                      {userName}
                    </div>

                    <div className="profile-menu-role">
                      Access User
                    </div>

                    <hr />

                    <button
                      type="button"
                      onClick={
                        handleLogout
                      }
                    >
                      🚪 Logout
                    </button>

                  </div>

                )}

              </div>

            </div>

          </div>
        )}

        {/* ================================================= */}
        {/* DASHBOARD */}
        {/* ================================================= */}

        {activePage === "dashboard" && (

          <div className="dashboard-area">


            {/* ================================================= */}
            {/* ICON GRID */}
            {/* ================================================= */}

            <div className="manager-icons-grid">

              {/* PUNCH IN */}
              <DashboardIcon
                type="punchIn"
                title="Punch In"
                subtitle="Mark attendance"
                onClick={() =>
                  setActivePage(
                    "punch-in"
                  )
                }
              />

              {/* PUNCH OUT */}
              <DashboardIcon
                type="punchOut"
                title="Punch Out"
                subtitle="End your shift"
                onClick={() =>
                  setActivePage(
                    "punch-out"
                  )
                }
              />

              {/* STAFF ATTENDANCE */}
              <DashboardIcon
                type="staff"
                title="Staff Attendance"
                subtitle="View attendance"
                onClick={() =>
                  setActivePage(
                    "staff-attendance"
                  )
                }
              />

              {/* READING */}
              <DashboardIcon
                type="reading"
                title="Reading"
                subtitle="Submit readings"
                onClick={() =>
                  setActivePage(
                    "reading"
                  )
                }
              />

              {/* TASKS */}
              <DashboardIcon
                type="tasks"
                title="Tasks"
                subtitle="View assigned tasks"
                onClick={() =>
                  setActivePage(
                    "tasks"
                  )
                }
              />

            </div>

          </div>

        )}

        {/* ================================================= */}
        {/* PUNCH IN */}
        {/* ================================================= */}

        {activePage === "punch-in" && (

          <Punch
            mode="in"
            project={
              selectedProject
            }
            onBack={() =>
              setActivePage(
                "dashboard"
              )
            }
          />

        )}

        {/* ================================================= */}
        {/* PUNCH OUT */}
        {/* ================================================= */}

        {activePage === "punch-out" && (

          <PunchOut
            project={
              selectedProject
            }
            onBack={() =>
              setActivePage(
                "dashboard"
              )
            }
          />

        )}

        {/* ================================================= */}
        {/* STAFF ATTENDANCE */}
        {/* ================================================= */}

        {activePage === "staff-attendance" && (

          <StaffAttendance
            project={
              selectedProject
            }
            onBack={() =>
              setActivePage(
                "dashboard"
              )
            }
          />

        )}

        {/* ================================================= */}
        {/* READING */}
        {/* ================================================= */}

        {activePage === "reading" && (

          <Reading
            project={
              selectedProject
            }
            onBack={() =>
              setActivePage(
                "dashboard"
              )
            }
          />

        )}

        {/* ================================================= */}
        {/* TASKS */}
        {/* ================================================= */}

        {activePage === "tasks" && (

          <Task
            project={
              selectedProject
            }
            onBack={() =>
              setActivePage(
                "dashboard"
              )
            }
          />

        )}

      </main>

      {/* ================================================= */}
      {/* CSS */}
      {/* ================================================= */}

      <style>{`

        * {
          box-sizing: border-box;
        }

   html,
body,
#root {
  width: 100%;
  min-height: 100%;

  overflow-x: hidden !important;
  overflow-y: auto !important;

  scrollbar-width: none;
}

html::-webkit-scrollbar,
body::-webkit-scrollbar,
#root::-webkit-scrollbar {
  display: none;
  width: 0;
}

        /* ================================================= */
        /* APP */
        /* ================================================= */

 .manager-app {
  width: 100%;
  min-height: 100vh;

  background: #f8f9fc;

  font-family:
    Arial,
    Helvetica,
    sans-serif;

  overflow-x: hidden !important;
  overflow-y: auto !important;

  scrollbar-width: none;
}

.manager-app::-webkit-scrollbar {
  display: none;
  width: 0;
}

        /* ================================================= */
        /* CONTENT */
        /* ================================================= */

 .manager-content {
  width: 100%;
  min-height: 100vh;

  padding:
    28px
    40px
    40px;

  overflow-x: hidden !important;
  overflow-y: visible !important;
}

        /* ================================================= */
        /* HEADER */
        /* ================================================= */

        .manager-top-header {

          width: 100%;

          min-height: 55px;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          gap: 20px;

          margin-bottom: 35px;
        }

        .header-left {
          min-width: 0;
        }

        .brand-title {

          font-size: 22px;

          font-weight: 700;

          color: #172033;
        }

        .brand-subtitle {

          margin-top: 4px;

          font-size: 12px;

          color: #64748b;
        }

      .header-right {
  width: 100%;

  display: flex;

  align-items: center;

  justify-content: flex-start;

  gap: 14px;

  min-width: 0;
}

        /* ================================================= */
        /* PROJECT SELECT */
        /* ================================================= */

        .project-select-box {

          display: flex;

          align-items: center;

          gap: 8px;

          min-width: 0;
        }

        .project-small-label {

          font-size: 12px;

          font-weight: 600;

          color: #64748b;
        }

        .project-select-box select {

          width: 200px;

          height: 40px;

          padding:
            0
            32px
            0
            13px;

          border:
            1px solid
            #dbe2ef;

          border-radius: 10px;

          background: #ffffff;

          color: #172033;

          font-size: 13px;

          font-weight: 600;

          outline: none;

          cursor: pointer;

          box-shadow:
            0
            3px
            12px
            rgba(
              0,
              0,
              0,
              0.04
            );
        }

        .project-select-box select:focus {

          border-color:
            #93c5fd;
        }

        /* ================================================= */
        /* PROFILE */
        /* ================================================= */

   .profile-wrapper {
  position: relative;

  z-index: 1000;

  margin-left: auto;
}
        .profile-button {

          height: 40px;

          border:
            1px solid
            #e2e8f0;

          background: #ffffff;

          border-radius: 10px;

          padding:
            4px
            10px;

          display: flex;

          align-items: center;

          gap: 7px;

          cursor: pointer;

          box-shadow:
            0
            3px
            12px
            rgba(
              0,
              0,
              0,
              0.04
            );
        }

        .profile-icon {

          width: 28px;

          height: 28px;

          border-radius: 50%;

          background:
            #eef2ff;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 14px;
        }

        .profile-name {

          max-width: 120px;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          font-size: 12px;

          font-weight: 600;

          color: #172033;
        }

        .profile-arrow {

          font-size: 10px;

          color: #64748b;
        }

        /* ================================================= */
        /* PROFILE MENU */
        /* ================================================= */

        .profile-menu {

          position: absolute;

          top: 47px;

          right: 0;

          width: 185px;

          padding: 12px;

          background: #ffffff;

          border:
            1px solid
            #e5e7eb;

          border-radius: 11px;

          box-shadow:
            0
            12px
            30px
            rgba(
              0,
              0,
              0,
              0.12
            );

          z-index: 2000;
        }

        .profile-menu-user {

          font-size: 13px;

          font-weight: 700;

          color: #172033;
        }

        .profile-menu-role {

          margin-top: 3px;

          font-size: 10px;

          color: #94a3b8;
        }

        .profile-menu hr {

          border: 0;

          border-top:
            1px solid
            #eef2f7;

          margin:
            10px 0;
        }

        .profile-menu button {

          width: 100%;

          border: none;

          background:
            #fff1f2;

          color: #dc2626;

          border-radius: 7px;

          padding: 8px;

          font-size: 12px;

          font-weight: 600;

          text-align: left;

          cursor: pointer;
        }

        /* ================================================= */
        /* DASHBOARD AREA */
        /* ================================================= */

        .dashboard-area {

          width: 100%;

          min-height:
            calc(
              100vh - 120px
            );
        }

        /* ================================================= */
        /* DASHBOARD HEADING */
        /* ================================================= */

        .dashboard-heading {

          margin-left: 10px;

          margin-bottom: 28px;
        }

        .dashboard-heading h1 {

          margin: 0;

          font-size: 27px;

          line-height: 1.2;

          font-weight: 700;

          color: #172033;
        }

        .dashboard-heading p {

          margin:
            6px
            0
            0;

          font-size: 12px;

          color: #64748b;
        }

        /* ================================================= */
        /* ICON GRID */
        /* ================================================= */

        .manager-icons-grid {

          width: 100%;

          max-width: 900px;

          margin:
            0
            auto;

          display: grid;

          grid-template-columns:
            repeat(
              5,
              115px
            );

          column-gap: 40px;

          row-gap: 40px;

          justify-content: center;

          align-items: start;

          padding:
            10px
            0;
        }

        /* ================================================= */
        /* ICON CARD */
        /* ================================================= */

        .dashboard-icon-card {

          width: 115px;

          min-width: 115px;

          border: none;

          background: transparent;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content:
            flex-start;

          cursor: pointer;

          padding: 0;

          transition:
            transform
            0.2s
            ease;

          -webkit-tap-highlight-color:
            transparent;
        }

        .dashboard-icon-card:hover {

          transform:
            translateY(-4px);
        }

        /* ================================================= */
        /* ICON BOX */
        /* ================================================= */

        .dashboard-icon-box {

          width: 78px;

          height: 78px;

          border-radius: 10px;

          background:
            #ffffff;

          display: flex;

          align-items: center;

          justify-content: center;

          box-shadow:
            0
            3px
            9px
            rgba(
              0,
              0,
              0,
              0.13
            );

          border:
            1px solid
            #e2e2e2;

          transition:
            box-shadow
            0.2s
            ease,
            transform
            0.2s
            ease;
        }

        .dashboard-icon-card:hover
        .dashboard-icon-box {

          box-shadow:
            0
            6px
            16px
            rgba(
              0,
              0,
              0,
              0.17
            );

          transform:
            scale(1.04);
        }

        /* ================================================= */
        /* SVG ICON */
        /* ================================================= */

        .dashboard-svg {

          width: 44px;

          height: 44px;

          display: block;
        }

        /* ================================================= */
        /* TITLE */
        /* ================================================= */

        .dashboard-icon-title {

          margin-top: 9px;

          font-size: 14px;

          font-weight: 400;

          color: #20232a;

          text-align: center;

          line-height: 1.2;

          white-space: nowrap;
        }

        /* ================================================= */
        /* SUBTITLE */
        /* ================================================= */

        .dashboard-icon-subtitle {

          display: none;
        }

        /* ================================================= */
        /* LARGE LAPTOP */
        /* ================================================= */

        @media (min-width: 1200px) {

          .manager-icons-grid {

            max-width: 900px;

            grid-template-columns:
              repeat(
                5,
                115px
              );

            column-gap: 38px;

            row-gap: 40px;

          }

        }

        /* ================================================= */
        /* TABLET */
        /* ================================================= */

        @media (max-width: 1000px) {

          .manager-content {

            padding:
              22px
              28px
              35px;
          }

          .manager-icons-grid {

            max-width: 650px;

            grid-template-columns:
              repeat(
                4,
                115px
              );

            column-gap: 35px;

            row-gap: 38px;

          }

        }

        /* ================================================= */
        /* MOBILE */
        /* ================================================= */

        @media (max-width: 768px) {

          .manager-content {

            width: 100%;

            padding:
              15px
              12px
              25px;
          }

.manager-top-header {
  width: 100%;

  min-height: 55px;

  display: flex;

  align-items: center;

  justify-content: flex-start;

  gap: 20px;

  margin-bottom: 35px;
}

          .header-left {

            flex: 1;

            min-width: 0;
          }

          .brand-title {

            font-size: 17px;
          }

          .brand-subtitle {

            font-size: 9px;
          }

         .header-right {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 14px;
}

          .project-select-box {

            display: block;
          }

          .project-small-label {

            display: none;
          }

          .project-select-box select {

            width: 125px;

            height: 34px;

            font-size: 10px;

            padding-left: 7px;
          }

          .profile-button {

            width: 34px;

            height: 34px;

            padding: 3px;

            justify-content:
              center;
          }

          .profile-icon {

            width: 27px;

            height: 27px;

            font-size: 13px;
          }

          .profile-name,
          .profile-arrow {

            display: none;
          }

          .profile-menu {

            top: 40px;

            right: 0;

            width: 165px;
          }

          /* DASHBOARD */

          .dashboard-heading {

            margin-left: 5px;

            margin-bottom: 20px;
          }

          .dashboard-heading h1 {

            font-size: 21px;
          }

          .dashboard-heading p {

            font-size: 10px;
          }

          /* ICON GRID */

          .manager-icons-grid {

            width: 100%;

            max-width: 330px;

            grid-template-columns:
              repeat(
                3,
                85px
              );

            column-gap: 22px;

            row-gap: 30px;

            justify-content:
              center;

            padding:
              5px
              0;
          }

          /* ICON */

          .dashboard-icon-card {

            width: 85px;

            min-width: 85px;
          }

          .dashboard-icon-box {

            width: 64px;

            height: 64px;

            border-radius: 9px;
          }

          .dashboard-svg {

            width: 34px;

            height: 34px;
          }

          .dashboard-icon-title {

            margin-top: 8px;

            font-size: 12px;
          }

        }

        /* ================================================= */
        /* SMALL MOBILE */
        /* ================================================= */

        @media (max-width: 400px) {

          .manager-content {

            padding:
              12px
              9px
              20px;
          }

          .brand-title {

            font-size: 15px;
          }

          .project-select-box select {

            width: 105px;

            font-size: 9px;
          }

          .dashboard-heading {

            margin-bottom: 18px;
          }

          .dashboard-heading h1 {

            font-size: 19px;
          }

          .manager-icons-grid {

            max-width: 270px;

            grid-template-columns:
              repeat(
                3,
                78px
              );

            column-gap: 15px;

            row-gap: 25px;

            justify-content:
              center;
          }

          .dashboard-icon-card {

            width: 78px;

            min-width: 78px;
          }

          .dashboard-icon-box {

            width: 58px;

            height: 58px;

            border-radius: 8px;
          }

          .dashboard-svg {

            width: 30px;

            height: 30px;
          }

          .dashboard-icon-title {

            font-size: 11px;

            margin-top: 7px;
          }

        }

      `}</style>

    </div>
  );
}

/* ================================================= */
/* DASHBOARD ICON COMPONENT */
/* ================================================= */

function DashboardIcon({
  type,
  title,
  subtitle,
  onClick,
}) {

  return (
    <button
      type="button"
      className="dashboard-icon-card"
      onClick={onClick}
    >

      <div className="dashboard-icon-box">

        <DashboardSVG
          type={type}
        />

      </div>

      <div className="dashboard-icon-title">
        {title}
      </div>

      <div className="dashboard-icon-subtitle">
        {subtitle}
      </div>

    </button>
  );
}

/* ================================================= */
/* SVG ICONS */
/* ================================================= */

function DashboardSVG({ type }) {

  /* ================================================= */
  /* PUNCH IN */
  /* ================================================= */

  if (type === "punchIn") {

    return (
      <svg
        className="dashboard-svg"
        viewBox="0 0 64 64"
        fill="none"
      >

        <path
          d="M30 12H48C50.2 12 52 13.8 52 16V48C52 50.2 50.2 52 48 52H30"
          stroke="#16a34a"
          strokeWidth="7"
          strokeLinecap="round"
        />

        <path
          d="M10 32H40"
          stroke="#16a34a"
          strokeWidth="7"
          strokeLinecap="round"
        />

        <path
          d="M29 21L40 32L29 43"
          stroke="#16a34a"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

      </svg>
    );
  }

  /* ================================================= */
  /* PUNCH OUT */
  /* ================================================= */

  if (type === "punchOut") {

    return (
      <svg
        className="dashboard-svg"
        viewBox="0 0 64 64"
        fill="none"
      >

        <path
          d="M34 12H16C13.8 12 12 13.8 12 16V48C12 50.2 13.8 52 16 52H34"
          stroke="#ef4444"
          strokeWidth="7"
          strokeLinecap="round"
        />

        <path
          d="M54 32H24"
          stroke="#ef4444"
          strokeWidth="7"
          strokeLinecap="round"
        />

        <path
          d="M35 21L24 32L35 43"
          stroke="#ef4444"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

      </svg>
    );
  }

  /* ================================================= */
  /* STAFF */
  /* ================================================= */

  if (type === "staff") {

    return (
      <svg
        className="dashboard-svg"
        viewBox="0 0 64 64"
        fill="none"
      >

        <circle
          cx="32"
          cy="21"
          r="9"
          fill="#2563eb"
        />

        <circle
          cx="16"
          cy="26"
          r="7"
          fill="#3b82f6"
        />

        <circle
          cx="48"
          cy="26"
          r="7"
          fill="#3b82f6"
        />

        <path
          d="M18 51C18 41 24 35 32 35C40 35 46 41 46 51"
          fill="#2563eb"
        />

        <path
          d="M3 49C3 41 8 36 15 36C19 36 22 38 24 41"
          fill="#60a5fa"
        />

        <path
          d="M61 49C61 41 56 36 49 36C45 36 42 38 40 41"
          fill="#60a5fa"
        />

      </svg>
    );
  }

  /* ================================================= */
  /* READING */
  /* ================================================= */

  if (type === "reading") {

    return (
      <svg
        className="dashboard-svg"
        viewBox="0 0 64 64"
        fill="none"
      >

        <rect
          x="10"
          y="9"
          width="44"
          height="46"
          rx="5"
          fill="#ffffff"
          stroke="#2563eb"
          strokeWidth="3"
        />

        <rect
          x="18"
          y="34"
          width="7"
          height="12"
          rx="1"
          fill="#22c55e"
        />

        <rect
          x="29"
          y="27"
          width="7"
          height="19"
          rx="1"
          fill="#f97316"
        />

        <rect
          x="40"
          y="19"
          width="7"
          height="27"
          rx="1"
          fill="#3b82f6"
        />

      </svg>
    );
  }

  /* ================================================= */
  /* TASKS */
  /* ================================================= */

  if (type === "tasks") {

    return (
      <svg
        className="dashboard-svg"
        viewBox="0 0 64 64"
        fill="none"
      >

        <rect
          x="16"
          y="9"
          width="34"
          height="46"
          rx="5"
          fill="#7c3aed"
        />

        <rect
          x="25"
          y="5"
          width="16"
          height="9"
          rx="4"
          fill="#6d28d9"
        />

        <path
          d="M23 25L27 29L34 21"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M23 38L27 42L34 34"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M39 25H45"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <path
          d="M39 38H45"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />

      </svg>
    );
  }

  return null;
}

export default ManagerDashboard;