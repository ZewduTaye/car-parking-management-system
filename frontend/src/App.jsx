import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Reservations from "./pages/Reservations";
import VIPReservation from "./pages/VIPReservation";
import ParkingSpaces from "./pages/ParkingSpaces";
import Staff from "./pages/Staff";

function RequireAuth({ children }) {
  return localStorage.getItem("token") ? children : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  return user?.role === "ADMIN" ? children : <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/customers" element={<RequireAuth><Customers /></RequireAuth>} />
        <Route path="/reservations" element={<RequireAuth><Reservations /></RequireAuth>} />
        <Route path="/vip-reservation" element={<RequireAuth><VIPReservation /></RequireAuth>} />
        <Route path="/parking-spaces" element={<RequireAuth><ParkingSpaces /></RequireAuth>} />
        <Route path="/staff" element={<RequireAuth><RequireAdmin><Staff /></RequireAdmin></RequireAuth>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;