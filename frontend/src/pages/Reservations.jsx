import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import PaymentOptions from "../components/PaymentOptions";

import {
  CalendarDays,
  Plus,
  Search,
  CarFront,
  Clock,
  MapPin,
  UserRound,
  X,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  createReservation,
  deleteReservation,
  getCustomers,
  getParkingSpaces,
  getReservations,
  updateReservation,
} from "../Services/api";

const emptyForm = {
  customerId: "",
  parkingSpaceId: "",
  date: "",
  start: "",
  end: "",
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString();
};

const formatTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getDateInputValue = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getTimeInputValue = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
};

const getStatusClasses = (status) => {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-100 text-green-700";

    case "COMPLETED":
      return "bg-blue-100 text-blue-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

    case "PENDING":
    default:
      return "bg-yellow-100 text-yellow-700";
  }
};

const getPaymentStatusClasses = (status) => {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-700";

    case "FAILED":
      return "bg-red-100 text-red-700";

    case "EXPIRED":
      return "bg-gray-100 text-gray-700";

    case "REFUNDED":
      return "bg-purple-100 text-purple-700";

    case "PENDING":
    default:
      return "bg-yellow-100 text-yellow-700";
  }
};

const getCustomerName = (reservation) => {
  if (reservation?.customer?.name) {
    return reservation.customer.name;
  }

  if (reservation?.customer?.fullName) {
    return reservation.customer.fullName;
  }

  if (reservation?.customerName) {
    return reservation.customerName;
  }

  return "Unknown customer";
};

const getVehiclePlate = (reservation) => {
  return (
    reservation?.customer?.vehiclePlate ||
    reservation?.customer?.plateNumber ||
    reservation?.vehiclePlate ||
    reservation?.carPlate ||
    "—"
  );
};

const getParkingName = (reservation) => {
  return (
    reservation?.parkingSpace?.spaceNumber ||
    reservation?.parkingSpace?.name ||
    reservation?.parkingSpaceName ||
    `Space ${reservation?.parkingSpaceId || "—"}`
  );
};

export default function Reservations() {
  const [showForm, setShowForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);

  const [search, setSearch] = useState("");

  const [reservations, setReservations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [parkingSpaces, setParkingSpaces] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // Reservation that needs payment
  const [paymentReservation, setPaymentReservation] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [reservationData, customerData, parkingData] =
        await Promise.all([
          getReservations(),
          getCustomers(),
          getParkingSpaces(),
        ]);

      setReservations(
        Array.isArray(reservationData)
          ? reservationData
          : reservationData?.reservations || []
      );

      setCustomers(
        Array.isArray(customerData)
          ? customerData
          : customerData?.customers || []
      );

      setParkingSpaces(
        Array.isArray(parkingData)
          ? parkingData
          : parkingData?.parkingSpaces || []
      );
    } catch (loadError) {
      console.error("Failed to load reservations:", loadError);
      setError(loadError.message || "Failed to load reservation data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredReservations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return reservations;
    }

    return reservations.filter((reservation) => {
      const customerName = getCustomerName(reservation);
      const vehiclePlate = getVehiclePlate(reservation);
      const parkingName = getParkingName(reservation);

      return (
        String(reservation.id || "")
          .toLowerCase()
          .includes(query) ||
        String(reservation.reservationCode || "")
          .toLowerCase()
          .includes(query) ||
        customerName.toLowerCase().includes(query) ||
        vehiclePlate.toLowerCase().includes(query) ||
        parkingName.toLowerCase().includes(query) ||
        String(reservation.status || "")
          .toLowerCase()
          .includes(query) ||
        String(reservation.paymentStatus || "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [reservations, search]);

  const openCreateForm = () => {
    setEditingReservation(null);
    setFormData(emptyForm);
    setError("");
    setShowForm(true);
  };

  const [formData, setFormData] = useState(emptyForm);

  const openEditForm = (reservation) => {
    setEditingReservation(reservation);

    setFormData({
      customerId: String(reservation.customerId || ""),
      parkingSpaceId: String(reservation.parkingSpaceId || ""),
      date: getDateInputValue(reservation.startTime),
      start: getTimeInputValue(reservation.startTime),
      end: getTimeInputValue(reservation.endTime),
    });

    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingReservation(null);
    setFormData(emptyForm);
    setError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      if (
        !formData.customerId ||
        !formData.parkingSpaceId ||
        !formData.date ||
        !formData.start ||
        !formData.end
      ) {
        throw new Error("Please complete all reservation fields.");
      }

      const startTime = `${formData.date}T${formData.start}`;
      const endTime = `${formData.date}T${formData.end}`;

      if (new Date(endTime) <= new Date(startTime)) {
        throw new Error("End time must be after start time.");
      }

      const reservationPayload = {
        customerId: Number(formData.customerId),
        parkingSpaceId: Number(formData.parkingSpaceId),
        startTime,
        endTime,
      };

      if (editingReservation) {
        const updatedReservation = await updateReservation(
          editingReservation.id,
          reservationPayload
        );

        setReservations((current) =>
          current.map((item) =>
            item.id === updatedReservation.id
              ? {
                ...item,
                ...updatedReservation,
              }
              : item
          )
        );
      } else {
        const newReservation = await createReservation(
          reservationPayload
        );

        setReservations((current) => [
          ...current,
          newReservation,
        ]);

        /*
         * New reservations are created as PENDING.
         * The backend also creates a payment deadline.
         *
         * Open the payment window immediately so the
         * customer can submit their payment reference.
         */
        if (
          newReservation?.status === "PENDING" &&
          newReservation?.paymentStatus === "PENDING"
        ) {
          setPaymentReservation(newReservation);
        }
      }

      setEditingReservation(null);
      setFormData(emptyForm);
      setShowForm(false);
    } catch (submitError) {
      console.error("Reservation save error:", submitError);

      setError(
        submitError.message ||
        "Failed to save reservation."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reservation) => {
    const confirmed = window.confirm(
      `Cancel reservation ${reservation.reservationCode ||
      `#${reservation.id}`
      }?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteReservation(reservation.id);

      setReservations((current) =>
        current.map((item) =>
          item.id === reservation.id
            ? {
              ...item,
              status: "CANCELLED",
            }
            : item
        )
      );
    } catch (deleteError) {
      console.error("Delete reservation error:", deleteError);

      setError(
        deleteError.message ||
        "Failed to cancel reservation."
      );
    }
  };

  const handlePaymentSubmitted = (updatedReservation) => {
    if (!updatedReservation) {
      setPaymentReservation(null);
      return;
    }

    setReservations((current) =>
      current.map((item) =>
        item.id === updatedReservation.id
          ? {
            ...item,
            ...updatedReservation,
          }
          : item
      )
    );

    setPaymentReservation(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-64 min-h-screen">
        <Navbar />

        <main className="p-6">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-3">
                  <CalendarDays className="h-6 w-6 text-blue-700" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    Reservations
                  </h1>

                  <p className="text-sm text-slate-500">
                    Manage parking reservations and payments
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" />
              New Reservation
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

              <div className="flex-1">
                <p className="font-semibold">
                  Something went wrong
                </p>

                <p className="text-sm">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setError("")}
                className="rounded-lg p-1 hover:bg-red-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Search + summary */}
          <div className="mb-5 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Total Reservations
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-800">
                {reservations.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Pending
              </p>

              <p className="mt-1 text-2xl font-bold text-yellow-600">
                {
                  reservations.filter(
                    (item) => item.status === "PENDING"
                  ).length
                }
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Confirmed
              </p>

              <p className="mt-1 text-2xl font-bold text-green-600">
                {
                  reservations.filter(
                    (item) => item.status === "CONFIRMED"
                  ).length
                }
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">
                Paid
              </p>

              <p className="mt-1 text-2xl font-bold text-blue-600">
                {
                  reservations.filter(
                    (item) => item.paymentStatus === "PAID"
                  ).length
                }
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by reservation code, customer, vehicle, parking space..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Reservations table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[1250px] w-full">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-4">
                      Reservation
                    </th>

                    <th className="px-5 py-4">
                      Customer
                    </th>

                    <th className="px-5 py-4">
                      Vehicle
                    </th>

                    <th className="px-5 py-4">
                      Parking
                    </th>

                    <th className="px-5 py-4">
                      Date
                    </th>

                    <th className="px-5 py-4">
                      Time
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4">
                      Payment
                    </th>

                    <th className="px-5 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="9"
                        className="px-5 py-16 text-center"
                      >
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                        <p className="mt-3 text-sm text-slate-500">
                          Loading reservations...
                        </p>
                      </td>
                    </tr>
                  ) : filteredReservations.length === 0 ? (
                    <tr>
                      <td
                        colSpan="9"
                        className="px-5 py-16 text-center"
                      >
                        <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />

                        <p className="mt-3 font-semibold text-slate-700">
                          No reservations found
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Create a new reservation to get started.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredReservations.map(
                      (reservation) => {
                        const customerName =
                          getCustomerName(
                            reservation
                          );

                        const vehiclePlate =
                          getVehiclePlate(
                            reservation
                          );

                        const parkingName =
                          getParkingName(
                            reservation
                          );

                        return (
                          <tr
                            key={reservation.id}
                            className="transition hover:bg-slate-50"
                          >
                            {/* Reservation */}
                            <td className="px-5 py-4">
                              <div className="font-semibold text-slate-800">
                                {reservation.reservationCode ||
                                  `#${reservation.id}`}
                              </div>

                              {reservation.totalAmount !==
                                undefined &&
                                reservation.totalAmount !==
                                null && (
                                  <div className="mt-1 text-xs text-slate-500">
                                    Amount:{" "}
                                    {reservation.totalAmount}
                                  </div>
                                )}
                            </td>

                            {/* Customer */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <div className="rounded-lg bg-slate-100 p-2">
                                  <UserRound className="h-4 w-4 text-slate-500" />
                                </div>

                                <span className="font-medium text-slate-700">
                                  {customerName}
                                </span>
                              </div>
                            </td>

                            {/* Vehicle */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <CarFront className="h-4 w-4 text-slate-400" />

                                <span className="font-medium text-slate-700">
                                  {vehiclePlate}
                                </span>
                              </div>
                            </td>

                            {/* Parking */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-slate-400" />

                                <span className="font-medium text-slate-700">
                                  {parkingName}
                                </span>
                              </div>
                            </td>

                            {/* Date */}
                            <td className="px-5 py-4 text-sm text-slate-600">
                              {formatDate(
                                reservation.startTime
                              )}
                            </td>

                            {/* Time */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Clock className="h-4 w-4 text-slate-400" />

                                <span>
                                  {formatTime(
                                    reservation.startTime
                                  )}{" "}
                                  -{" "}
                                  {formatTime(
                                    reservation.endTime
                                  )}
                                </span>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                  reservation.status
                                )}`}
                              >
                                {reservation.status ||
                                  "PENDING"}
                              </span>
                            </td>

                            {/* Payment */}
                            <td className="px-5 py-4">
                              <div className="flex flex-col items-start gap-1">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusClasses(
                                    reservation.paymentStatus
                                  )}`}
                                >
                                  {reservation.paymentStatus ===
                                    "PAID" ? (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  ) : (
                                    <CreditCard className="h-3.5 w-3.5" />
                                  )}

                                  {reservation.paymentStatus ||
                                    "PENDING"}
                                </span>

                                {reservation.paymentMethod && (
                                  <span className="text-[11px] text-slate-400">
                                    {
                                      reservation.paymentMethod
                                    }
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-2">
                                {reservation.status ===
                                  "PENDING" &&
                                  reservation.paymentStatus !==
                                  "PAID" && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPaymentReservation(
                                          reservation
                                        )
                                      }
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                                      title="Pay reservation"
                                    >
                                      <CreditCard className="h-4 w-4" />
                                      Pay
                                    </button>
                                  )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditForm(
                                      reservation
                                    )
                                  }
                                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
                                  title="Edit reservation"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      reservation
                                    )
                                  }
                                  className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                                  title="Cancel reservation"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* =====================================================
          CREATE / EDIT RESERVATION MODAL
          ===================================================== */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {editingReservation
                    ? "Edit Reservation"
                    : "New Reservation"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingReservation
                    ? "Update the reservation details."
                    : "Create a parking reservation."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="max-h-[75vh] overflow-y-auto p-6"
            >
              <div className="grid gap-5 md:grid-cols-2">
                {/* Customer */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Customer
                  </label>

                  <select
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">
                      Select customer
                    </option>

                    {customers.map((customer) => (
                      <option
                        key={customer.id}
                        value={customer.id}
                      >
                        {customer.name ||
                          customer.fullName ||
                          customer.customerName ||
                          `Customer #${customer.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vehicle */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Vehicle
                  </label>

                  <input
                    type="text"
                    value={
                      formData.customerId
                        ? getVehiclePlate(
                          customers.find(
                            (customer) =>
                              String(
                                customer.id
                              ) ===
                              String(
                                formData.customerId
                              )
                          )
                        )
                        : ""
                    }
                    readOnly
                    placeholder="Vehicle plate"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600 outline-none"
                  />
                </div>

                {/* Parking space */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Parking Space
                  </label>

                  <select
                    name="parkingSpaceId"
                    value={formData.parkingSpaceId}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">
                      Select parking space
                    </option>

                    {parkingSpaces.map((space) => (
                      <option
                        key={space.id}
                        value={space.id}
                      >
                        {space.spaceNumber ||
                          space.name ||
                          `Space #${space.id}`}
                        {space.status
                          ? ` — ${space.status}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Date
                  </label>

                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Start */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Start Time
                  </label>

                  <input
                    type="time"
                    name="start"
                    value={formData.start}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* End */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    End Time
                  </label>

                  <input
                    type="time"
                    name="end"
                    value={formData.end}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Payment information */}
              {!editingReservation && (
                <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex gap-3">
                    <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                    <div>
                      <p className="font-semibold text-blue-800">
                        Payment required
                      </p>

                      <p className="mt-1 text-sm text-blue-700">
                        After creating the reservation,
                        you will be asked to submit your
                        payment information. The reservation
                        remains pending until payment is
                        verified.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form buttons */}
              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}

                  {editingReservation
                    ? "Save Changes"
                    : "Create Reservation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          PAYMENT MODAL
          ===================================================== */}
      {paymentReservation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl">
            <PaymentOptions
              reservation={paymentReservation}
              onPaymentSubmitted={
                handlePaymentSubmitted
              }
              onCancel={() =>
                setPaymentReservation(null)
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}