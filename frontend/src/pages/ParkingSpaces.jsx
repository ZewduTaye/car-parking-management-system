
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ParkingCard from "../components/ParkingCard";

function ParkingSpaces() {
  const spaces = [
    { number: "A-01", status: "available" },
    { number: "A-02", status: "occupied" },
    { number: "A-03", status: "reserved" },
    { number: "A-04", status: "available" },
    { number: "A-05", status: "occupied" },
    { number: "A-06", status: "available" },
    { number: "A-07", status: "reserved" },
    { number: "A-08", status: "available" },
    { number: "B-01", status: "available" },
    { number: "B-02", status: "occupied" },
    { number: "B-03", status: "available" },
    { number: "B-04", status: "reserved" },
  ];

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Navbar title="Parking Spaces" />

        <div className="page-header">
          <div>
            <h1>🅿️ Parking Spaces</h1>
            <p>Monitor parking space availability</p>
          </div>

          <button className="btn btn-primary">
            + Add Space
          </button>
        </div>

        <div className="parking-summary">
          <div className="parking-summary-card">
            <span>🅿️</span>
            <div>
              <p>Total</p>
              <h3>{spaces.length}</h3>
            </div>
          </div>

          <div className="parking-summary-card">
            <span>✅</span>
            <div>
              <p>Available</p>
              <h3>
                {spaces.filter((space) => space.status === "available").length}
              </h3>
            </div>
          </div>

          <div className="parking-summary-card">
            <span>🚘</span>
            <div>
              <p>Occupied</p>
              <h3>
                {spaces.filter((space) => space.status === "occupied").length}
              </h3>
            </div>
          </div>

          <div className="parking-summary-card">
            <span>📅</span>
            <div>
              <p>Reserved</p>
              <h3>
                {spaces.filter((space) => space.status === "reserved").length}
              </h3>
            </div>
          </div>
        </div>

        <div className="parking-grid">
          {spaces.map((space) => (
            <ParkingCard
              key={space.number}
              number={space.number}
              status={space.status}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default ParkingSpaces;

