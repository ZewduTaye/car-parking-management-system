import { Bell, ChevronDown, UserCircle } from "lucide-react";

function Navbar({ title = "Dashboard" }) {
  return (
    <header className="navbar">
      <div className="navbar-title">
        <h1>{title}</h1>
        <p>Car Parking Management System</p>
      </div>

      <div className="navbar-actions">
        <button className="notification-button" title="Notifications">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>

        <div className="navbar-user">
          <div className="user-avatar">
            <UserCircle size={22} />
          </div>

          <div className="user-info">
            <strong>Admin</strong>
            <small>Administrator</small>
          </div>

          <ChevronDown size={17} className="user-arrow" />
        </div>
      </div>
    </header>
  );
}

export default Navbar;

