import { useNavigate, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Star,
  CarFront,
  UserCog,
  LogOut,
  ParkingSquare,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();

  // Sidebar collapsed state
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });

  // Apply collapsed state
  useEffect(() => {
    document.documentElement.classList.toggle(
      "sidebar-collapsed",
      collapsed
    );

    localStorage.setItem(
      "sidebarCollapsed",
      String(collapsed)
    );
  }, [collapsed]);

  // Toggle sidebar
  const toggleSidebar = () => {
    setCollapsed((value) => !value);
  };

  // Logout
  const handleLogout = (e) => {
    e.preventDefault();

    // Remove authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Return to login page
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">

      {/* =========================
          LOGO
      ========================== */}
      <div className="sidebar-logo">

        <div className="sidebar-logo-icon">
          <CarFront size={25} />
        </div>

        <div className="sidebar-logo-text">
          <strong>
            Park<span>Ease</span>
          </strong>

          <small>
            Management System
          </small>
        </div>

        {/* COLLAPSE BUTTON */}
        <button
          type="button"
          className="sidebar-toggle"
          onClick={toggleSidebar}
          title={
            collapsed
              ? "Expand menu"
              : "Collapse menu"
          }
          aria-label={
            collapsed
              ? "Expand menu"
              : "Collapse menu"
          }
        >
          {collapsed ? (
            <PanelLeftOpen size={19} />
          ) : (
            <PanelLeftClose size={19} />
          )}
        </button>
      </div>

      {/* =========================
          MENU
      ========================== */}
      <nav className="sidebar-menu">

        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          className="sidebar-link"
          title="Dashboard"
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        {/* Customers */}
        <NavLink
          to="/customers"
          className="sidebar-link"
          title="Customers"
        >
          <Users size={20} />
          <span>Customers</span>
        </NavLink>

        {/* Reservations */}
        <NavLink
          to="/reservations"
          className="sidebar-link"
          title="Reservations"
        >
          <CalendarDays size={20} />
          <span>Reservations</span>
        </NavLink>

        {/* VIP Reservation */}
        <NavLink
          to="/vip-reservation"
          className="sidebar-link"
          title="VIP Reservation"
        >
          <Star size={20} />
          <span>VIP Reservation</span>
        </NavLink>

        {/* Parking Spaces */}
        <NavLink
          to="/parking-spaces"
          className="sidebar-link"
          title="Parking Spaces"
        >
          <ParkingSquare size={20} />
          <span>Parking Spaces</span>
        </NavLink>

        {/* Staff */}
        <NavLink
          to="/staff"
          className="sidebar-link"
          title="Staff"
        >
          <UserCog size={20} />
          <span>Staff</span>
        </NavLink>

      </nav>

      {/* =========================
          LOGOUT
      ========================== */}
      <div className="sidebar-bottom">

        <button
          type="button"
          className="sidebar-link logout-link"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;