import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  UserCircle,
  Moon,
  Sun,
  LogOut,
  User,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar({ title = "Dashboard" }) {
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  /* =========================================
     USER
  ========================================= */

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "null"
      );
    } catch {
      return null;
    }
  });

  /* =========================================
     DARK MODE
  ========================================= */

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  /* =========================================
     SIDEBAR
  ========================================= */

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(() => {
      return (
        localStorage.getItem("sidebarCollapsed") ===
        "true"
      );
    });

  /* =========================================
     USER DROPDOWN
  ========================================= */

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  /* =========================================
     APPLY INITIAL SIDEBAR STATE
  ========================================= */

  useEffect(() => {
    const isCollapsed =
      localStorage.getItem("sidebarCollapsed") ===
      "true";

    setSidebarCollapsed(isCollapsed);

    document.documentElement.classList.toggle(
      "sidebar-collapsed",
      isCollapsed
    );

    document.documentElement.style.setProperty(
      "--sidebar-width",
      isCollapsed ? "82px" : "250px"
    );
  }, []);

  /* =========================================
     DARK MODE
  ========================================= */

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark-theme",
      darkMode
    );

    localStorage.setItem(
      "theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  /* =========================================
     SIDEBAR STATE LISTENER
  ========================================= */

  useEffect(() => {
    const handleSidebarChange = () => {
      const isCollapsed =
        localStorage.getItem("sidebarCollapsed") ===
        "true";

      setSidebarCollapsed(isCollapsed);

      document.documentElement.classList.toggle(
        "sidebar-collapsed",
        isCollapsed
      );

      document.documentElement.style.setProperty(
        "--sidebar-width",
        isCollapsed ? "82px" : "250px"
      );
    };

    window.addEventListener(
      "sidebar-state-change",
      handleSidebarChange
    );

    return () => {
      window.removeEventListener(
        "sidebar-state-change",
        handleSidebarChange
      );
    };
  }, []);

  /* =========================================
     TOGGLE SIDEBAR
  ========================================= */

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;

    setSidebarCollapsed(newState);

    localStorage.setItem(
      "sidebarCollapsed",
      String(newState)
    );

    document.documentElement.classList.toggle(
      "sidebar-collapsed",
      newState
    );

    document.documentElement.style.setProperty(
      "--sidebar-width",
      newState ? "82px" : "250px"
    );

    window.dispatchEvent(
      new CustomEvent("sidebar-state-change")
    );
  };

  /* =========================================
     TOGGLE DARK MODE
  ========================================= */

  const toggleTheme = () => {
    setDarkMode((value) => !value);
  };

  /* =========================================
     CLOSE USER MENU WHEN CLICKING OUTSIDE
  ========================================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =========================================
     USER MENU
  ========================================= */

  const toggleUserMenu = () => {
    setUserMenuOpen((value) => !value);
  };

  /* =========================================
     PROFILE
  ========================================= */

  const handleProfile = () => {
    setUserMenuOpen(false);

    navigate("/profile");
  };

  /* =========================================
     SETTINGS
  ========================================= */

  const handleSettings = () => {
    setUserMenuOpen(false);

    navigate("/settings");
  };

  /* =========================================
     LOGOUT
  ========================================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setUserMenuOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  /* =========================================
     DISPLAY USER
  ========================================= */

  const displayName =
    user?.name || "System Administrator";

  const displayRole =
    user?.role || "ADMIN";

  /* =========================================
     JSX
  ========================================= */

  return (
    <header className="navbar">

      {/* =====================================
          LEFT SIDE
      ====================================== */}

      <div className="navbar-left">

        {/* SIDEBAR COLLAPSE BUTTON */}

        <button
          type="button"
          className="navbar-sidebar-toggle"
          onClick={toggleSidebar}
          title={
            sidebarCollapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          aria-label={
            sidebarCollapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen size={21} />
          ) : (
            <PanelLeftClose size={21} />
          )}
        </button>

        {/* PAGE TITLE */}

        <div className="navbar-title">
          <h1>{title}</h1>

          <p>
            Car Parking Management System
          </p>
        </div>
      </div>

      {/* =====================================
          RIGHT SIDE
      ====================================== */}

      <div className="navbar-actions">

        {/* DARK / LIGHT MODE */}

        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          title={
            darkMode
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          aria-label={
            darkMode
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
        >
          {darkMode ? (
            <Sun size={19} />
          ) : (
            <Moon size={19} />
          )}
        </button>

        {/* NOTIFICATIONS */}

        <button
          type="button"
          className="notification-button"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={20} />

          <span className="notification-dot"></span>
        </button>

        {/* =================================
            ADMIN USER AREA
        ================================== */}

        <div
          className="navbar-user-wrapper"
          ref={userMenuRef}
        >

          {/* ADMIN BUTTON */}

          <button
            type="button"
            className="navbar-user"
            onClick={toggleUserMenu}
            aria-expanded={userMenuOpen}
            aria-haspopup="menu"
          >

            {/* AVATAR */}

            <div className="user-avatar">
              <UserCircle size={23} />
            </div>

            {/* USER INFORMATION */}

            <div className="user-info">
              <strong>{displayName}</strong>

              <small>{displayRole}</small>
            </div>

            {/* ARROW */}

            <ChevronDown
              size={17}
              className={`user-arrow ${userMenuOpen ? "rotate" : ""
                }`}
            />

          </button>

          {/* =================================
              ADMIN DROPDOWN
          ================================== */}

          {userMenuOpen && (
            <div
              className="user-dropdown"
              role="menu"
            >

              {/* USER HEADER */}

              <div className="user-dropdown-header">

                <div className="user-dropdown-avatar">
                  <UserCircle size={28} />
                </div>

                <div className="user-dropdown-user-info">

                  <strong>
                    {displayName}
                  </strong>

                  <span>
                    {displayRole}
                  </span>

                </div>
              </div>

              {/* DIVIDER */}

              <div className="user-dropdown-divider"></div>

              {/* MY PROFILE */}

              <button
                type="button"
                className="user-dropdown-item"
                onClick={handleProfile}
                role="menuitem"
              >
                <User size={18} />

                <span>
                  My Profile
                </span>
              </button>

              {/* SETTINGS */}

              <button
                type="button"
                className="user-dropdown-item"
                onClick={handleSettings}
                role="menuitem"
              >
                <Settings size={18} />

                <span>
                  Settings
                </span>
              </button>

              {/* DIVIDER */}

              <div className="user-dropdown-divider"></div>

              {/* LOGOUT */}

              <button
                type="button"
                className="user-dropdown-item logout"
                onClick={handleLogout}
                role="menuitem"
              >
                <LogOut size={18} />

                <span>
                  Logout
                </span>
              </button>

            </div>
          )}

        </div>
      </div>
    </header>
  );
}

export default Navbar;                                  