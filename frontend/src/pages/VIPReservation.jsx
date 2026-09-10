import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
function VIPReservation() {
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

              <form className="vip-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Customer Name</label>
                    <input
                      type="text"
                      placeholder="Enter customer name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Car Plate</label>
                    <input
                      type="text"
                      placeholder="e.g. ET-12345"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>VIP Parking Space</label>
                    <select>
                      <option value="">Select parking space</option>
                      <option value="VIP-01">VIP-01</option>
                      <option value="VIP-02">VIP-02</option>
                      <option value="VIP-03">VIP-03</option>
                      <option value="VIP-04">VIP-04</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Reservation Date</label>
                    <input type="date" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Time</label>
                    <input type="time" />
                  </div>

                  <div className="form-group">
                    <label>End Time</label>
                    <input type="time" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Special Request</label>
                  <textarea
                    rows="4"
                    placeholder="Enter any special request..."
                  ></textarea>
                </div>

                <button type="submit" className="vip-submit-btn">
                  ⭐ Create VIP Reservation
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default VIPReservation;

