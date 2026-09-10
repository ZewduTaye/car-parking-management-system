import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Star,
  CarFront,
  UserCog,
  LogOut,
  ParkingSquare,
} from "lucide-react";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <CarFront size={25} />
        </div>

        <div className="sidebar-logo-text">
          <strong>Park<span>Ease</span></strong>
          <small>Management System</small>
        </div>
      </div>

      <nav className="sidebar-menu">

        <NavLink to="/dashboard" className="sidebar-link">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/customers" className="sidebar-link">
          <Users size={20} />
          <span>Customers</span>
        </NavLink>

        <NavLink to="/reservations" className="sidebar-link">
          <CalendarDays size={20} />
          <span>Reservations</span>
        </NavLink>

        <NavLink to="/vip-reservation" className="sidebar-link">
          <Star size={20} />
          <span>VIP Reservation</span>
        </NavLink>

        <NavLink to="/parking-spaces" className="sidebar-link">
          <ParkingSquare size={20} />
          <span>Parking Spaces</span>
        </NavLink>

        <NavLink to="/staff" className="sidebar-link">
          <UserCog size={20} />
          <span>Staff</span>
        </NavLink>

      </nav>

      <div className="sidebar-bottom">
        <NavLink to="/login" className="sidebar-link logout-link">
          <LogOut size={20} />
          <span>Logout</span>
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;

