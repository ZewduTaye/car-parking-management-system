import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {
  CalendarDays,
  Plus,
  Search,
  CarFront,
  Clock,
  MapPin,
  UserRound,
  X,
} from "lucide-react";

function Reservations() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const [reservations, setReservations] = useState([
    {
      id: 1,
      customer: "Abebe Kebede",
      plate: "ET-12345",
      space: "A-01",
      date: "2026-09-03",
      start: "09:00",
      end: "12:00",
      status: "Confirmed",
    },
    {
      id: 2,
      customer: "Sara Ahmed",
      plate: "ET-67890",
      space: "A-05",
      date: "2026-09-03",
      start: "13:00",
      end: "16:00",
      status: "Pending",
    },
  ]);

  const [formData, setFormData] = useState({
    customer: "",
    plate: "",
    space: "",
    date: "",
    start: "",
    end: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newReservation = {
      id: reservations.length + 1,
      customer: formData.customer,
      plate: formData.plate,
      space: formData.space,
      date: formData.date,
      start: formData.start,
      end: formData.end,
      status: "Pending",
    };

    setReservations([...reservations, newReservation]);

    setFormData({
      customer: "",
      plate: "",
      space: "",
      date: "",
      start: "",
      end: "",
    });

    setShowForm(false);
  };

  const filteredReservations = reservations.filter((reservation) => {
    const text = search.toLowerCase();

    return (
      reservation.customer.toLowerCase().includes(text) ||
      reservation.plate.toLowerCase().includes(text) ||
      reservation.space.toLowerCase().includes(text)
    );
  });

  const confirmedCount = reservations.filter(
    (reservation) => reservation.status === "Confirmed"
  ).length;

  const pendingCount = reservations.filter(
    (reservation) => reservation.status === "Pending"
  ).length;

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Navbar title="Reservations" />

        <div className="reservations-page">

          {/* HEADER */}
          <div className="reservations-header">
            <div className="reservations-title">
              <div className="reservations-title-icon">
                <CalendarDays size={26} />
              </div>

              <div>
                <h1>Reservations</h1>
                <p>Manage parking reservations and bookings</p>
              </div>
            </div>

            <button
              className="reservation-add-btn"
              onClick={() => setShowForm(true)}
            >
              <Plus size={19} />
              New Reservation
            </button>
          </div>

          {/* SUMMARY */}
          <div className="reservation-summary">

            <div className="reservation-summary-card">
              <div className="reservation-summary-icon blue">
                <CalendarDays size={23} />
              </div>

              <div>
                <p>Total Reservations</p>
                <h3>{reservations.length}</h3>
              </div>
            </div>

            <div className="reservation-summary-card">
              <div className="reservation-summary-icon green">
                <CalendarDays size={23} />
              </div>

              <div>
                <p>Confirmed</p>
                <h3>{confirmedCount}</h3>
              </div>
            </div>

            <div className="reservation-summary-card">
              <div className="reservation-summary-icon orange">
                <Clock size={23} />
              </div>

              <div>
                <p>Pending</p>
                <h3>{pendingCount}</h3>
              </div>
            </div>

          </div>

          {/* SEARCH */}
          <div className="reservations-toolbar">

            <div className="reservation-search">
              <Search size={19} />

              <input
                type="text"
                placeholder="Search customer, plate or parking space..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="reservation-count">
              <CalendarDays size={17} />
              <span>
                {filteredReservations.length} reservations
              </span>
            </div>

          </div>

          {/* TABLE */}
          <div className="reservation-table-container">

            <table className="reservation-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Parking Space</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {filteredReservations.map((reservation) => (

                  <tr key={reservation.id}>

                    <td>
                      <span className="reservation-id">
                        #{reservation.id}
                      </span>
                    </td>

                    <td>
                      <div className="reservation-customer">

                        <div className="reservation-avatar">
                          <UserRound size={18} />
                        </div>

                        <div>
                          <strong>{reservation.customer}</strong>
                          <small>Customer</small>
                        </div>

                      </div>
                    </td>

                    <td>
                      <div className="reservation-vehicle">
                        <CarFront size={17} />
                        {reservation.plate}
                      </div>
                    </td>

                    <td>
                      <div className="reservation-space">
                        <MapPin size={16} />
                        {reservation.space}
                      </div>
                    </td>

                    <td>
                      {reservation.date}
                    </td>

                    <td>
                      <div className="reservation-time">
                        <Clock size={15} />
                        {reservation.start} - {reservation.end}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`reservation-status ${
                          reservation.status === "Confirmed"
                            ? "confirmed"
                            : "pending"
                        }`}
                      >
                        {reservation.status}
                      </span>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

            {filteredReservations.length === 0 && (
              <div className="reservation-empty">
                <CalendarDays size={40} />
                <h3>No reservations found</h3>
                <p>Try searching with a different keyword.</p>
              </div>
            )}

          </div>

        </div>

        {/* NEW RESERVATION MODAL */}
        {showForm && (
          <div
            className="reservation-modal-overlay"
            onClick={() => setShowForm(false)}
          >

            <div
              className="reservation-modal"
              onClick={(e) => e.stopPropagation()}
            >

              <div className="reservation-modal-header">

                <div>
                  <h2>New Reservation</h2>
                  <p>Create a new parking reservation</p>
                </div>

                <button
                  className="reservation-close-btn"
                  onClick={() => setShowForm(false)}
                >
                  <X size={20} />
                </button>

              </div>

              <form
                className="reservation-form"
                onSubmit={handleSubmit}
              >

                <div className="reservation-form-row">

                  <div className="reservation-form-group">
                    <label>Customer Name</label>

                    <input
                      type="text"
                      name="customer"
                      placeholder="Enter customer name"
                      value={formData.customer}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="reservation-form-group">
                    <label>Car Plate</label>

                    <input
                      type="text"
                      name="plate"
                      placeholder="e.g. ET-12345"
                      value={formData.plate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                </div>

                <div className="reservation-form-row">

                  <div className="reservation-form-group">
                    <label>Parking Space</label>

                    <select
                      name="space"
                      value={formData.space}
                      onChange={handleChange}
                      required
                    >
                      <option value="">
                        Select parking space
                      </option>

                      <option value="A-01">A-01</option>
                      <option value="A-02">A-02</option>
                      <option value="A-03">A-03</option>
                      <option value="A-04">A-04</option>
                      <option value="A-05">A-05</option>
                      <option value="B-01">B-01</option>
                      <option value="B-02">B-02</option>
                      <option value="B-03">B-03</option>
                    </select>
                  </div>

                  <div className="reservation-form-group">
                    <label>Reservation Date</label>

                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                </div>

                <div className="reservation-form-row">

                  <div className="reservation-form-group">
                    <label>Start Time</label>

                    <input
                      type="time"
                      name="start"
                      value={formData.start}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="reservation-form-group">
                    <label>End Time</label>

                    <input
                      type="time"
                      name="end"
                      value={formData.end}
                      onChange={handleChange}
                      required
                    />
                  </div>

                </div>

                <div className="reservation-form-actions">

                  <button
                    type="button"
                    className="reservation-cancel-btn"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="reservation-submit-btn"
                  >
                    <CalendarDays size={18} />
                    Create Reservation
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}

export default Reservations;

