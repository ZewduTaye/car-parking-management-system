import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {
  ParkingSquare,
  CircleCheck,
  CarFront,
  CalendarDays,
  TrendingUp,
  Clock,
  ArrowRight,
} from "lucide-react";

function Dashboard() {
  const stats = [
    {
      title: "Total Parking Spaces",
      value: "150",
      icon: ParkingSquare,
      className: "blue",
    },
    {
      title: "Available Spaces",
      value: "75",
      icon: CircleCheck,
      className: "green",
    },
    {
      title: "Occupied Spaces",
      value: "25",
      icon: CarFront,
      className: "orange",
    },
    {
      title: "Today's Reservations",
      value: "12",
      icon: CalendarDays,
      className: "purple",
    },
  ];

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Navbar title="Dashboard" />

        <div className="dashboard-page">

          {/* Welcome Section */}
          <div className="dashboard-welcome">
            <div>
              <h1>Welcome back, Admin! 👋</h1>
              <p>
                Here's what's happening with your parking system today.
              </p>
            </div>

            <div className="dashboard-date">
              <Clock size={18} />
              <span>Today's Overview</span>
            </div>
          </div>

          {/* Statistics */}
          <div className="dashboard-cards">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div className="dashboard-card" key={stat.title}>
                  <div className={`dashboard-card-icon ${stat.className}`}>
                    <Icon size={25} />
                  </div>

                  <div className="dashboard-card-content">
                    <p>{stat.title}</p>
                    <h2>{stat.value}</h2>
                  </div>

                  <TrendingUp
                    className="dashboard-trend-icon"
                    size={18}
                  />
                </div>
              );
            })}
          </div>

          {/* Main Dashboard Area */}
          <div className="dashboard-grid">

            {/* Parking Overview */}
            <div className="dashboard-panel">
              <div className="panel-header">
                <div>
                  <h2>Parking Overview</h2>
                  <p>Current parking space status</p>
                </div>

                <ParkingSquare size={22} />
              </div>

              <div className="parking-overview">

                <div className="overview-item">
                  <div className="overview-icon available-icon">
                    <CircleCheck size={22} />
                  </div>

                  <div className="overview-info">
                    <span>Available</span>
                    <strong>75 Spaces</strong>
                  </div>

                  <div className="overview-bar">
                    <div
                      className="overview-progress available-progress"
                      style={{ width: "83.3%" }}
                    ></div>
                  </div>
                </div>

                <div className="overview-item">
                  <div className="overview-icon occupied-icon">
                    <CarFront size={22} />
                  </div>

                  <div className="overview-info">
                    <span>Occupied</span>
                    <strong>25 Spaces</strong>
                  </div>

                  <div className="overview-bar">
                    <div
                      className="overview-progress occupied-progress"
                      style={{ width: "25%" }}
                    ></div>
                  </div>
                </div>

                <div className="overview-total">
                  <div>
                    <span>Parking Capacity</span>
                    <strong>25%</strong>
                  </div>

                  <p>25 out of 100 spaces are currently occupied.</p>
                </div>

              </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-panel">
              <div className="panel-header">
                <div>
                  <h2>Quick Actions</h2>
                  <p>Manage your parking system</p>
                </div>
              </div>

              <div className="quick-actions">

                <a href="/reservations" className="quick-action">
                  <div className="quick-action-icon">
                    <CalendarDays size={21} />
                  </div>

                  <div>
                    <strong>Reservations</strong>
                    <span>Manage bookings</span>
                  </div>

                  <ArrowRight size={18} />
                </a>

                <a href="/parking-spaces" className="quick-action">
                  <div className="quick-action-icon">
                    <ParkingSquare size={21} />
                  </div>

                  <div>
                    <strong>Parking Spaces</strong>
                    <span>View parking areas</span>
                  </div>

                  <ArrowRight size={18} />
                </a>

                <a href="/customers" className="quick-action">
                  <div className="quick-action-icon">
                    <CarFront size={21} />
                  </div>

                  <div>
                    <strong>Customers</strong>
                    <span>Manage customers</span>
                  </div>

                  <ArrowRight size={18} />
                </a>

              </div>
            </div>

          </div>

          {/* Recent Activity */}
          <div className="dashboard-panel recent-panel">
            <div className="panel-header">
              <div>
                <h2>Recent Activity</h2>
                <p>Latest parking system activity</p>
              </div>
            </div>

            <div className="activity-list">

              <div className="activity-item">
                <div className="activity-icon">
                  <CarFront size={19} />
                </div>

                <div className="activity-content">
                  <strong>Vehicle parked</strong>
                  <span>Parking space A-02</span>
                </div>

                <small>10 min ago</small>
              </div>

              <div className="activity-item">
                <div className="activity-icon">
                  <CalendarDays size={19} />
                </div>

                <div className="activity-content">
                  <strong>New reservation</strong>
                  <span>Parking space A-05</span>
                </div>

                <small>25 min ago</small>
              </div>

              <div className="activity-item">
                <div className="activity-icon">
                  <CircleCheck size={19} />
                </div>

                <div className="activity-content">
                  <strong>Parking space available</strong>
                  <span>Parking space B-03</span>
                </div>

                <small>1 hour ago</small>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;
