function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">

      {/* MENU */}
      <nav className="sidebar-menu">

        <button
          className={`sidebar-item ${
            activePage === "dashboard" ? "active" : ""
          }`}
          onClick={() => onNavigate("dashboard")}
        >
          <span>Dashboard</span>
        </button>

        <button
          className={`sidebar-item ${
            activePage === "office" ? "active" : ""
          }`}
          onClick={() => onNavigate("office")}
        >
          <span>Office</span>
        </button>

        <button
          className={`sidebar-item ${
            activePage === "project" ? "active" : ""
          }`}
          onClick={() => onNavigate("project")}
        >
          <span>Project</span>
        </button>

        <button
          className={`sidebar-item ${
            activePage === "settings" ? "active" : ""
          }`}
          onClick={() => onNavigate("settings")}
        >
          <span>Settings</span>
        </button>

      </nav>

      {/* LOGOUT */}
      <button
        className="sidebar-logout"
        onClick={() => onNavigate("logout")}
      >
        <span>Logout</span>
      </button>

    </aside>
  );
}

export default Sidebar;