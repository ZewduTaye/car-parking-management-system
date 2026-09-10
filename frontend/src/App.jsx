import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Reservations from "./pages/Reservations";
import VIPReservation from "./pages/VIPReservation";
import ParkingSpaces from "./pages/ParkingSpaces";
import Staff from "./pages/Staff";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/customers" element={<Customers />} />

        <Route path="/reservations" element={<Reservations />} />

        <Route
          path="/vip-reservation"
          element={<VIPReservation />}
        />

        <Route
          path="/parking-spaces"
          element={<ParkingSpaces />}
        />

        <Route path="/staff" element={<Staff />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;