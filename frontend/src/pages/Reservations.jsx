import { useEffect, useState } from "react";
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
import {
  createReservation,
  deleteReservation,
  getCustomers,
  getParkingSpaces,
  getReservations,
  updateReservation,
} from "../Services/api";

function Reservations() {
  const [showForm, setShowForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [search, setSearch] = useState("");
  const [reservations, setReservations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [parkingSpaces, setParkingSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    customerId: "",
    parkingSpaceId: "",
    date: "",
    start: "",
    end: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setError("");
        const [reservationData, customerData, parkingSpaceData] = await Promise.all([
          getReservations(),
          getCustomers(),
          getParkingSpaces(),
        ]);
        setReservations(reservationData);
        setCustomers(customerData);
        setParkingSpaces(parkingSpaceData);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const openCreateForm = () => {
    setEditingReservation(null);
    setFormData({ customerId: "", parkingSpaceId: "", date: "", start: "", end: "" });
    setError("");
    setShowForm(true);
  };

  const openEditForm = (reservation) => {
    const start = new Date(reservation.startTime);
    const end = new Date(reservation.endTime);
    setEditingReservation(reservation);
    setFormData({
      customerId: String(reservation.customer.id),
      parkingSpaceId: String(reservation.parkingSpace.id),
      date: reservation.startTime.slice(0, 10),
      start: start.toISOString().slice(11, 16),
      end: end.toISOString().slice(11, 16),
    });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const reservationPayload = {
        customerId: Number(formData.customerId),
        parkingSpaceId: Number(formData.parkingSpaceId),
        startTime: `${formData.date}T${formData.start}`,
        endTime: `${formData.date}T${formData.end}`,
      };
      const reservation = editingReservation
        ? await updateReservation(editingReservation.id, reservationPayload)
        : await createReservation(reservationPayload);

      setReservations((current) => editingReservation
        ? current.map((item) => item.id === reservation.id ? reservation : item)
        : [...current, reservation]
      );
      setEditingReservation(null);
      setFormData({ customerId: "", parkingSpaceId: "", date: "", start: "", end: "" });
      setShowForm(false);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredReservations = reservations.filter((reservation) => {
    const text = search.toLowerCase();

    return (
      reservation.customer?.fullName?.toLowerCase().includes(text) ||
      reservation.customer?.carPlate?.toLowerCase().includes(text) ||
      reservation.parkingSpace?.spaceNumber?.toLowerCase().includes(text)
    );
  });

  const confirmedCount = reservations.filter(
    (reservation) => reservation.status === "CONFIRMED"
  ).length;

  const pendingCount = reservations.filter(
    (reservation) => reservation.status === "PENDING"
  ).length;

  const formatDate = (value) => new Date(value).toLocaleDateString();
  const formatTime = (value) => new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleCancel = async (reservation) => {
    if (!window.confirm("Cancel this reservation?")) return;

    try {
      setError("");
      await deleteReservation(reservation.id);
      setReservations((current) => current.map((item) =>
        item.id === reservation.id ? { ...item, status: "CANCELLED" } : item
      ));
    } catch (cancelError) {
      setError(cancelError.message);
    }
  };

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
              onClick={openCreateForm}
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
                  <th>Actions</th>
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
                          <strong>{reservation.customer?.fullName}</strong>
                          <small>Customer</small>
                        </div>

                      </div>
                    </td>

                    <td>
                      <div className="reservation-vehicle">
                        <CarFront size={17} />
                        {reservation.customer?.carPlate}
                      </div>
                    </td>

                    <td>
                      <div className="reservation-space">
                        <MapPin size={16} />
                        {reservation.parkingSpace?.spaceNumber}
                      </div>
                    </td>

                    <td>
                      {formatDate(reservation.startTime)}
                    </td>

                    <td>
                      <div className="reservation-time">
                        <Clock size={15} />
                        {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`reservation-status ${reservation.status.toLowerCase()}`}
                      >
                        {reservation.status}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="reservation-cancel-btn"
                        onClick={() => openEditForm(reservation)}
                      >
                        Edit
                      </button>
                      {reservation.status !== "CANCELLED" && (
                        <button
                          type="button"
                          className="reservation-cancel-btn"
                          onClick={() => handleCancel(reservation)}
                        >
                          Cancel
                        </button>
                      )}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

            {loading ? (
              <div className="reservation-empty">
                <CalendarDays size={40} />
                <h3>Loading reservations...</h3>
              </div>
            ) : error && reservations.length === 0 ? (
              <div className="reservation-empty">
                <CalendarDays size={40} />
                <h3>Unable to load reservations</h3>
                <p>{error}</p>
              </div>
            ) : filteredReservations.length === 0 && (
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
                  <h2>{editingReservation ? "Edit Reservation" : "New Reservation"}</h2>
                  <p>{editingReservation ? "Update the parking reservation" : "Create a new parking reservation"}</p>
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

                    <select
                      name="customerId"
                      value={formData.customerId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.fullName} ({customer.carPlate})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="reservation-form-group">
                    <label>Car Plate</label>

                    <input
                      type="text"
                      value={customers.find((customer) => String(customer.id) === String(formData.customerId))?.carPlate || ""}
                      placeholder="Selected customer plate"
                      readOnly
                    />
                  </div>

                </div>

                <div className="reservation-form-row">

                  <div className="reservation-form-group">
                    <label>Parking Space</label>

                    <select
                      name="parkingSpaceId"
                      value={formData.parkingSpaceId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">
                        Select parking space
                      </option>

                      {parkingSpaces
                        .filter((space) => ["AVAILABLE", "RESERVED"].includes(space.status))
                        .map((space) => (
                          <option key={space.id} value={space.id}>
                            {space.spaceNumber}
                          </option>
                        ))}
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
                    disabled={saving}
                  >
                    <CalendarDays size={18} />
                    {saving ? "Saving..." : editingReservation ? "Save Changes" : "Create Reservation"}
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

