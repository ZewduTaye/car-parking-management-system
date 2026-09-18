// =====================================================
// API CONFIGURATION
// =====================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

// =====================================================
// COMMON REQUEST FUNCTION
// =====================================================

const request = async (path, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.body
      ? { "Content-Type": "application/json" }
      : {}),
    ...(token
      ? { Authorization: `Bearer ${token}` }
      : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    // -------------------------------------------------
    // Unauthorized
    // -------------------------------------------------

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }

      throw new Error(
        data.message || "Unauthorized. Please login again."
      );
    }

    // -------------------------------------------------
    // Other API errors
    // -------------------------------------------------

    if (!response.ok) {
      throw new Error(
        data.message ||
        data.error ||
        `Request failed with status ${response.status}`
      );
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// =====================================================
// BACKEND TEST
// =====================================================

export const testBackend = async () => {
  return request("/test");
};

// =====================================================
// AUTHENTICATION
// =====================================================

export const registerCustomer = async (customer) => {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(customer),
  });
};

export const loginUser = async (credentials) => {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

export const getCurrentUser = async () => {
  return request("/auth/me");
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Optional redirect to login page
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

// =====================================================
// CUSTOMERS
// =====================================================

export const getCustomers = async () => {
  const data = await request("/customers");

  return data.customers || [];
};

export const createCustomer = async (customer) => {
  const data = await request("/customers", {
    method: "POST",
    body: JSON.stringify(customer),
  });

  return data.customer;
};

export const updateCustomer = async (id, customer) => {
  const data = await request(`/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(customer),
  });

  return data.customer;
};

export const deleteCustomer = async (id) => {
  return request(`/customers/${id}`, {
    method: "DELETE",
  });
};

// =====================================================
// PARKING SPACES
// =====================================================

export const getParkingSpaces = async () => {
  const data = await request("/parking-spaces");

  return data.spaces || [];
};

export const createParkingSpace = async (space) => {
  const data = await request("/parking-spaces", {
    method: "POST",
    body: JSON.stringify(space),
  });

  return data.space;
};

export const updateParkingSpace = async (id, space) => {
  const data = await request(`/parking-spaces/${id}`, {
    method: "PUT",
    body: JSON.stringify(space),
  });

  return data.space;
};

export const deleteParkingSpace = async (id) => {
  return request(`/parking-spaces/${id}`, {
    method: "DELETE",
  });
};

// =====================================================
// RESERVATIONS
// =====================================================

export const getReservations = async () => {
  const data = await request("/reservations");

  return data.reservations || [];
};

export const createReservation = async (reservation) => {
  const data = await request("/reservations", {
    method: "POST",
    body: JSON.stringify(reservation),
  });

  return data.reservation;
};

export const updateReservation = async (
  id,
  reservation
) => {
  const data = await request(`/reservations/${id}`, {
    method: "PUT",
    body: JSON.stringify(reservation),
  });

  return data.reservation;
};

export const updateReservationStatus = async (
  id,
  status
) => {
  const data = await request(
    `/reservations/${id}/status`,
    {
      method: "PUT",
      body: JSON.stringify({ status }),
    }
  );

  return data.reservation;
};

export const deleteReservation = async (id) => {
  return request(`/reservations/${id}`, {
    method: "DELETE",
  });
};

// =====================================================
// VIP RESERVATIONS
// =====================================================

export const getVIPReservations = async () => {
  const data = await request("/reservations/vip");

  return data.reservations || [];
};

export const createVIPReservation = async (
  reservation
) => {
  const data = await request("/reservations/vip", {
    method: "POST",
    body: JSON.stringify(reservation),
  });

  return data.reservation;
};

export const updateVIPReservation = async (
  id,
  reservation
) => {
  const data = await request(
    `/reservations/vip/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(reservation),
    }
  );

  return data.reservation;
};

export const cancelVIPReservation = async (id) => {
  return request(`/reservations/vip/${id}`, {
    method: "DELETE",
  });
};

// =====================================================
// STAFF
// =====================================================

export const getStaff = async () => {
  const data = await request("/staff");

  return data.staff || [];
};

export const createStaff = async (staff) => {
  const data = await request("/staff", {
    method: "POST",
    body: JSON.stringify(staff),
  });

  return data.staff;
};

export const updateStaff = async (id, staff) => {
  const data = await request(`/staff/${id}`, {
    method: "PUT",
    body: JSON.stringify(staff),
  });

  return data.staff;
};

export const deleteStaff = async (id) => {
  return request(`/staff/${id}`, {
    method: "DELETE",
  });
};

// =====================================================
// DASHBOARD
// =====================================================

export const getDashboardStats = async () => {
  const data = await request("/dashboard");

  return data;
};

// =====================================================
// PAYMENTS
// =====================================================

export const getPaymentApi = async () => {
  return request("/payments");
};

export const submitPayment = async (payment) => {
  const data = await request("/payments/submit", {
    method: "POST",
    body: JSON.stringify(payment),
  });

  return data.reservation;
};

export const getPaymentByReservation = async (
  reservationCode
) => {
  const data = await request(
    `/payments/reservation/${encodeURIComponent(
      reservationCode
    )}`
  );

  return data.payment;
};

export const verifyPayment = async (
  reservationCode,
  approved
) => {
  const data = await request(
    `/payments/verify/${encodeURIComponent(
      reservationCode
    )}`,
    {
      method: "PUT",
      body: JSON.stringify({ approved }),
    }
  );

  return data.reservation;
};

// =====================================================
// VEHICLE INSPECTION
// =====================================================

export const getVehicleInspections = async () => {
  const data = await request("/vehicle-inspections");

  return data.inspections || [];
};

export const createVehicleInspection = async (
  inspection
) => {
  const data = await request(
    "/vehicle-inspections",
    {
      method: "POST",
      body: JSON.stringify(inspection),
    }
  );

  return data.inspection;
};

export const updateVehicleInspection = async (
  id,
  inspection
) => {
  const data = await request(
    `/vehicle-inspections/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(inspection),
    }
  );

  return data.inspection;
};

export const deleteVehicleInspection = async (id) => {
  return request(`/vehicle-inspections/${id}`, {
    method: "DELETE",
  });
};

// =====================================================
// EXPORT API URL
// =====================================================

export default API_URL;