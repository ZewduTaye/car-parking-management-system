import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {
  cancelVIPReservation,
  createVIPReservation,
  getCustomers,
  getParkingSpaces,
  getVIPReservations,
} from "../Services/api";

function VIPReservation() {
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
    specialRequest: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [reservationData, customerData, parkingSpaceData] = await Promise.all([
          getVIPReservations(),
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ customerId: "", parkingSpaceId: "", date: "", start: "", end: "", specialRequest: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const reservation = await createVIPReservation({
        customerId: Number(formData.customerId),
        parkingSpaceId: Number(formData.parkingSpaceId),
        startTime: `${formData.date}T${formData.start}`,
        endTime: `${formData.date}T${formData.end}`,
        specialRequest: formData.specialRequest,
      });
      setReservations((current) => [...current, reservation]);
      resetForm();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (reservation) => {
    if (!window.confirm("Cancel this VIP reservation?")) return;

    try {
      setError("");
      await cancelVIPReservation(reservation.id);
      setReservations((current) => current.map((item) =>
        item.id === reservation.id ? { ...item, status: "CANCELLED" } : item
      ));
    } catch (cancelError) {
      setError(cancelError.message);
    }
  };

  const selectedCustomer = customers.find(
    (customer) => String(customer.id) === String(formData.customerId)
  );

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Navbar title="VIP Reservation" />

        <div className="vip-page">
          <div className="vip-header">
            <div>
              <h1>⭐ VIP Reservation</h1>
              <p>Reserve premium parking for VIP customers</p>
            </div>
          </div>

          <div className="vip-content">
            <div className="vip-card">
              <div className="vip-card-header">
                <span className="vip-icon">⭐</span>
                <div>
                  <h2>VIP Parking</h2>
                  <p>Premium parking reservation</p>
                </div>
              </div>

                  <form className="vip-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Customer Name</label>
                    <select name="customerId" value={formData.customerId} onChange={handleChange} required>
                      <option value="">Select customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>{customer.fullName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Car Plate</label>
                    <input type="text" value={selectedCustomer?.carPlate || ""} placeholder="Selected customer plate" readOnly />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>VIP Parking Space</label>
                    <select name="parkingSpaceId" value={formData.parkingSpaceId} onChange={handleChange} required>
                      <option value="">Select parking space</option>
                      {parkingSpaces
                        .filter((space) => space.isVIP && ["AVAILABLE", "RESERVED"].includes(space.status))
                        .map((space) => (
                          <option key={space.id} value={space.id}>{space.spaceNumber}</option>
                        ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Reservation Date</label>
                    <input name="date" type="date" value={formData.date} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Time</label>
                    <input name="start" type="time" value={formData.start} onChange={handleChange} required />
                  </div>

                  <div className="form-group">
                    <label>End Time</label>
                    <input name="end" type="time" value={formData.end} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Special Request</label>
                  <textarea
                    name="specialRequest"
                    rows="4"
                    placeholder="Enter any special request..."
                    value={formData.specialRequest}
                    onChange={handleChange}
                  ></textarea>
                </div>

                {error && <p role="alert">{error}</p>}

                <button type="submit" className="vip-submit-btn" disabled={saving}>
                  ⭐ {saving ? "Creating..." : "Create VIP Reservation"}
                </button>
              </form>
            </div>
          </div>

          <div className="vip-card">
            <div className="vip-card-header">
              <span className="vip-icon">📋</span>
              <div>
                <h2>VIP Reservations</h2>
                <p>Existing premium parking reservations</p>
              </div>
            </div>
            {loading ? <p>Loading VIP reservations...</p> : reservations.length === 0 ? <p>No VIP reservations found.</p> : reservations.map((reservation) => (
              <div key={reservation.id} className="vip-reservation-row">
                <strong>{reservation.customer?.fullName}</strong>
                <span>{reservation.parkingSpace?.spaceNumber}</span>
                <span>{new Date(reservation.startTime).toLocaleString()}</span>
                <span>{reservation.status}</span>
                {reservation.status !== "CANCELLED" && <button type="button" onClick={() => handleCancel(reservation)}>Cancel</button>}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default VIPReservation;

