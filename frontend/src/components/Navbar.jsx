import { useEffect, useState } from "react";
import {
  Bell,
  ChevronDown,
  UserCircle,
  Moon,
  Sun,
} from "lucide-react";

function Navbar({ title = "Dashboard" }) {

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

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

  const toggleTheme = () => {
    setDarkMode((value) => !value);
  };

  return (
    <header className="navbar">

      {/* PAGE TITLE */}
      <div className="navbar-title">

        <h1>{title}</h1>

        <p>
          Car Parking Management System
        </p>

      </div>

      {/* RIGHT SIDE */}
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

        {/* USER */}
        <div className="navbar-user">

          <div className="user-avatar">
            <UserCircle size={22} />
          </div>

          <div className="user-info">

            <strong>
              {user?.name || "User"}
            </strong>

            <small>
              {user?.role || "Staff"}
            </small>

          </div>

          <ChevronDown
            size={17}
            className="user-arrow"
          />

        </div>

      </div>

    </header>
  );
}

export default Navbar;