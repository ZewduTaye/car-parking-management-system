import { useEffect, useState } from "react";
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
import { getDashboardStats } from "../Services/api";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setError("");
        setDashboard(await getDashboardStats());
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const statsData = dashboard?.stats || {};
  const stats = [
    {
      title: "Total Parking Spaces",
      value: statsData.totalParkingSpaces ?? 0,
      icon: ParkingSquare,
      className: "blue",
    },
    {
      title: "Available Spaces",
      value: statsData.availableSpaces ?? 0,
      icon: CircleCheck,
      className: "green",
    },
    {
      title: "Occupied Spaces",
      value: statsData.occupiedSpaces ?? 0,
      icon: CarFront,
      className: "orange",
    },
    {
      title: "Today's Reservations",
      value: statsData.todaysReservations ?? 0,
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
          {loading && <div className="customers-message"><h2>Loading dashboard...</h2></div>}
          {error && <div className="customers-message"><h2>Unable to load dashboard</h2><p>{error}</p></div>}

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
                    <strong>{statsData.availableSpaces ?? 0} Spaces</strong>
                  </div>

                  <div className="overview-bar">
                    <div
                      className="overview-progress available-progress"
                      style={{ width: `${statsData.totalParkingSpaces ? Math.round((statsData.availableSpaces / statsData.totalParkingSpaces) * 100) : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="overview-item">
                  <div className="overview-icon occupied-icon">
                    <CarFront size={22} />
                  </div>

                  <div className="overview-info">
                    <span>Occupied</span>
                    <strong>{statsData.occupiedSpaces ?? 0} Spaces</strong>
                  </div>

                  <div className="overview-bar">
                    <div
                      className="overview-progress occupied-progress"
                      style={{ width: `${statsData.occupancyPercentage ?? 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="overview-total">
                  <div>
                    <span>Parking Capacity</span>
                    <strong>{statsData.occupancyPercentage ?? 0}%</strong>
                  </div>

                  <p>{statsData.occupiedSpaces ?? 0} out of {statsData.totalParkingSpaces ?? 0} spaces are currently occupied.</p>
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
              {(dashboard?.recentActivity || []).length === 0 ? (
                <div className="activity-item">
                  <div className="activity-icon"><CalendarDays size={19} /></div>
                  <div className="activity-content"><strong>No recent activity</strong><span>New activity will appear here.</span></div>
                </div>
              ) : dashboard.recentActivity.map((activity) => (
                <div className="activity-item" key={`${activity.type}-${activity.createdAt}`}>
                  <div className="activity-icon"><CalendarDays size={19} /></div>
                  <div className="activity-content"><strong>{activity.title}</strong><span>{activity.detail}</span></div>
                  <small>{new Date(activity.createdAt).toLocaleString()}</small>
                </div>
              ))}

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;
