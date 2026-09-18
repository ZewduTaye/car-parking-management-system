import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Star,
  UserCog,
  LogOut,
  ParkingSquare,
  CarFront,
  ChevronRight,
} from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();

  // ============================================================
  // SIDEBAR COLLAPSED STATE
  // ============================================================
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });

  // ============================================================
  // APPLY SIDEBAR WIDTH
  // ============================================================
  useEffect(() => {
    const applySidebarState = (isCollapsed) => {
      setCollapsed(isCollapsed);

      document.documentElement.classList.toggle(
        "sidebar-collapsed",
        isCollapsed
      );

      document.documentElement.style.setProperty(
        "--sidebar-width",
        isCollapsed ? "82px" : "260px"
      );
    };

    const initialState =
      localStorage.getItem("sidebarCollapsed") === "true";

    applySidebarState(initialState);

    const handleSidebarChange = () => {
      const isCollapsed =
        localStorage.getItem("sidebarCollapsed") === "true";

      applySidebarState(isCollapsed);
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

  // ============================================================
  // LOGOUT
  // ============================================================
  const handleLogout = (event) => {
    event.preventDefault();

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  // ============================================================
  // MENU ITEMS
  // ============================================================
  const menuItems = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: "/customers",
      label: "Customers",
      icon: Users,
    },
    {
      to: "/reservations",
      label: "Reservations",
      icon: CalendarDays,
    },
    {
      to: "/vip-reservation",
      label: "VIP Reservation",
      icon: Star,
    },
    {
      to: "/parking-spaces",
      label: "Parking Spaces",
      icon: ParkingSquare,
    },
    {
      to: "/staff",
      label: "Staff",
      icon: UserCog,
    },
  ];

  // ============================================================
  // SIDEBAR
  // ============================================================
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>

      {/* ======================================================
          LOGO
      ======================================================= */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <CarFront size={27} strokeWidth={2.3} />
        </div>

        {!collapsed && (
          <div className="sidebar-logo-text">
            <strong>
              Park<span>Ease</span>
            </strong>

            <small>Management System</small>
          </div>
        )}
      </div>

      {/* ======================================================
          MENU
      ======================================================= */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={21} strokeWidth={2} />

              {!collapsed && (
                <span>{item.label}</span>
              )}

              {!collapsed && (
                <ChevronRight
                  className="sidebar-link-arrow"
                  size={16}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ======================================================
          BOTTOM AREA
      ======================================================= */}
      <div className="sidebar-bottom">
        <button
          type="button"
          className="sidebar-link logout-link"
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={21} strokeWidth={2} />

          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;