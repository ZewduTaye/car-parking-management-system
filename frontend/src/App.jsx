import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

// =========================
// AUTH PAGES
// =========================
import Login from "./pages/Login";
import Register from "./pages/Register";

// =========================
// CUSTOMER
// =========================
import CustomerDashboard from "./pages/CustomerDashboard";

// =========================
// ADMIN / STAFF
// =========================
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Reservations from "./pages/Reservations";
import VIPReservation from "./pages/VIPReservation";
import ParkingSpaces from "./pages/ParkingSpaces";
import Staff from "./pages/Staff";

// =========================
// PROFILE & SETTINGS
// =========================
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

// ============================================================
// GET CURRENT USER
// ============================================================
function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

// ============================================================
// GENERAL AUTH PROTECTION
// ============================================================
function RequireAuth({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}

// ============================================================
// STAFF / ADMIN PROTECTION
// ============================================================
function RequireStaff({ children }) {
  const user = getStoredUser();

  if (
    user?.role !== "ADMIN" &&
    user?.role !== "STAFF"
  ) {
    return (
      <Navigate
        to="/customer-dashboard"
        replace
      />
    );
  }

  return children;
}

// ============================================================
// ADMIN PROTECTION
// ============================================================
function RequireAdmin({ children }) {
  const user = getStoredUser();

  if (user?.role !== "ADMIN") {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}

// ============================================================
// CUSTOMER PROTECTION
// ============================================================
function RequireCustomer({ children }) {
  const token = localStorage.getItem("token");
  const user = getStoredUser();

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (user?.role !== "CUSTOMER") {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}

// ============================================================
// ROOT REDIRECT
// ============================================================
function RootRedirect() {
  const token = localStorage.getItem("token");
  const user = getStoredUser();

  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (user.role === "CUSTOMER") {
    return (
      <Navigate
        to="/customer-dashboard"
        replace
      />
    );
  }

  if (
    user.role === "ADMIN" ||
    user.role === "STAFF"
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return (
    <Navigate
      to="/login"
      replace
    />
  );
}

// ============================================================
// APP
// ============================================================
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================================
            AUTHENTICATION
        ====================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =====================================================
            CUSTOMER
        ====================================================== */}

        <Route
          path="/customer-dashboard"
          element={
            <RequireCustomer>
              <CustomerDashboard />
            </RequireCustomer>
          }
        />


        {/* =====================================================
            ADMIN / STAFF DASHBOARD
        ====================================================== */}

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <RequireStaff>
                <Dashboard />
              </RequireStaff>
            </RequireAuth>
          }
        />


        {/* =====================================================
            CUSTOMERS MANAGEMENT
        ====================================================== */}

        <Route
          path="/customers"
          element={
            <RequireAuth>
              <RequireStaff>
                <Customers />
              </RequireStaff>
            </RequireAuth>
          }
        />


        {/* =====================================================
            RESERVATIONS
        ====================================================== */}

        <Route
          path="/reservations"
          element={
            <RequireAuth>
              <Reservations />
            </RequireAuth>
          }
        />


        {/* =====================================================
            VIP RESERVATION
        ====================================================== */}

        <Route
          path="/vip-reservation"
          element={
            <RequireAuth>
              <RequireStaff>
                <VIPReservation />
              </RequireStaff>
            </RequireAuth>
          }
        />


        {/* =====================================================
            PARKING SPACES
        ====================================================== */}

        <Route
          path="/parking-spaces"
          element={
            <RequireAuth>
              <ParkingSpaces />
            </RequireAuth>
          }
        />


        {/* =====================================================
            ADMIN ONLY - STAFF
        ====================================================== */}

        <Route
          path="/staff"
          element={
            <RequireAuth>
              <RequireAdmin>
                <Staff />
              </RequireAdmin>
            </RequireAuth>
          }
        />


        {/* =====================================================
            MY PROFILE
        ====================================================== */}

        <Route
          path="/profile"
          element={
            <RequireAuth>
              <RequireStaff>
                <Profile />
              </RequireStaff>
            </RequireAuth>
          }
        />


        {/* =====================================================
            SETTINGS
        ====================================================== */}

        <Route
          path="/settings"
          element={
            <RequireAuth>
              <RequireStaff>
                <Settings />
              </RequireStaff>
            </RequireAuth>
          }
        />


        {/* =====================================================
            DEFAULT
        ====================================================== */}

        <Route
          path="*"
          element={<RootRedirect />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;