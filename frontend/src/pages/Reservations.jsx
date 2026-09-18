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
  Camera,
  AlertTriangle,
  Image as ImageIcon,
} from "lucide-react";

import {
  createReservation,
  deleteReservation,
  getCustomers,
  getParkingSpaces,
  getReservations,
  updateReservation,
} from "../Services/api";

/* =========================================================
   Constants
   ========================================================= */

const emptyForm = {
  customerId: "",
  parkingSpaceId: "",
  date: "",
  start: "",
  end: "",

  // Vehicle inspection
  vehicleCondition: "NO_DAMAGE",
  vehicleNotes: "",
  vehicleFrontPhoto: "",
  vehicleRearPhoto: "",
  vehicleLeftPhoto: "",
  vehicleRightPhoto: "",
};

/* =========================================================
   Formatting helpers
   ========================================================= */

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString();
};

const formatTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getDateInputValue = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getTimeInputValue = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
};

/* =========================================================
   Status styles
   ========================================================= */

const getStatusClasses = (status) => {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-100 text-green-700";

    case "COMPLETED":
      return "bg-blue-100 text-blue-700";

    case "CANCELLED":
      return "bg-red-100 text-red-700";

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

    default:
      return "bg-yellow-100 text-yellow-700";
  }
};

const getVehicleConditionClasses = (condition) => {
  switch (condition) {
    case "NO_DAMAGE":
      return "bg-green-100 text-green-700";

    case "MINOR_SCRATCH":
      return "bg-yellow-100 text-yellow-700";

    case "EXISTING_BODY_DAMAGE":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-600";
  }
};

const getVehicleConditionLabel = (condition) => {
  switch (condition) {
    case "NO_DAMAGE":
      return "No damage";

    case "MINOR_SCRATCH":
      return "Minor scratch";

    case "EXISTING_BODY_DAMAGE":
      return "Existing body damage";

    default:
      return "Not recorded";
  }
};

/* =========================================================
   Data helpers
   ========================================================= */

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

/* =========================================================
   Image compression
   ========================================================= */

const compressImage = (
  file,
  maxWidth = 1000,
  quality = 0.72
) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      reject(new Error("Please select an image file."));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
          reject(
            new Error(
              "Could not process the selected image."
            )
          );
          return;
        }

        context.drawImage(
          img,
          0,
          0,
          width,
          height
        );

        const compressedImage = canvas.toDataURL(
          "image/jpeg",
          quality
        );

        resolve(compressedImage);
      };

      img.onerror = () => {
        reject(
          new Error(
            "Could not read the selected image."
          )
        );
      };

      img.src = event.target.result;
    };

    reader.onerror = () => {
      reject(
        new Error(
          "Failed to read the selected image."
        )
      );
    };

    reader.readAsDataURL(file);
  });
};

/* =========================================================
   Main Component
   ========================================================= */

export default function Reservations() {
  const [showForm, setShowForm] = useState(false);

  const [editingReservation, setEditingReservation] =
    useState(null);

  const [search, setSearch] = useState("");

  const [reservations, setReservations] = useState([]);

  const [customers, setCustomers] = useState([]);

  const [parkingSpaces, setParkingSpaces] =
    useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [formData, setFormData] =
    useState({ ...emptyForm });

  // Reservation currently being paid
  const [paymentReservation, setPaymentReservation] =
    useState(null);

  /* =======================================================
     Load data
     ======================================================= */

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        reservationData,
        customerData,
        parkingData,
      ] = await Promise.all([
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
      console.error(
        "Failed to load reservations:",
        loadError
      );

      setError(
        loadError.message ||
        "Failed to load reservation data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* =======================================================
     Search
     ======================================================= */

  const filteredReservations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return reservations;
    }

    return reservations.filter((reservation) => {
      const customerName =
        getCustomerName(reservation);

      const vehiclePlate =
        getVehiclePlate(reservation);

      const parkingName =
        getParkingName(reservation);

      const condition =
        getVehicleConditionLabel(
          reservation.vehicleCondition
        );

      return (
        String(reservation.id || "")
          .toLowerCase()
          .includes(query) ||
        String(
          reservation.reservationCode || ""
        )
          .toLowerCase()
          .includes(query) ||
        customerName
          .toLowerCase()
          .includes(query) ||
        vehiclePlate
          .toLowerCase()
          .includes(query) ||
        parkingName
          .toLowerCase()
          .includes(query) ||
        String(reservation.status || "")
          .toLowerCase()
          .includes(query) ||
        String(
          reservation.paymentStatus || ""
        )
          .toLowerCase()
          .includes(query) ||
        condition
          .toLowerCase()
          .includes(query)
      );
    });
  }, [reservations, search]);

  /* =======================================================
     Create form
     ======================================================= */

  const openCreateForm = () => {
    setEditingReservation(null);

    setFormData({
      ...emptyForm,
    });

    setError("");
    setShowForm(true);
  };

  /* =======================================================
     Edit form
     ======================================================= */

  const openEditForm = (reservation) => {
    setEditingReservation(reservation);

    setFormData({
      customerId: String(
        reservation.customerId || ""
      ),

      parkingSpaceId: String(
        reservation.parkingSpaceId || ""
      ),

      date: getDateInputValue(
        reservation.startTime
      ),

      start: getTimeInputValue(
        reservation.startTime
      ),

      end: getTimeInputValue(
        reservation.endTime
      ),

      vehicleCondition:
        reservation.vehicleCondition ||
        "NO_DAMAGE",

      vehicleNotes:
        reservation.vehicleNotes || "",

      vehicleFrontPhoto:
        reservation.vehicleFrontPhoto || "",

      vehicleRearPhoto:
        reservation.vehicleRearPhoto || "",

      vehicleLeftPhoto:
        reservation.vehicleLeftPhoto || "",

      vehicleRightPhoto:
        reservation.vehicleRightPhoto || "",
    });

    setError("");
    setShowForm(true);
  };

  /* =======================================================
     Close form
     ======================================================= */

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingReservation(null);

    setFormData({
      ...emptyForm,
    });

    setError("");
  };

  /* =======================================================
     Form change
     ======================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /* =======================================================
     Vehicle photo upload
     ======================================================= */

  const handlePhotoChange = async (
    event,
    fieldName
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setError("");

      if (file.size > 10 * 1024 * 1024) {
        throw new Error(
          "Image is too large. Please select an image smaller than 10 MB."
        );
      }

      const compressedImage =
        await compressImage(file);

      setFormData((current) => ({
        ...current,
        [fieldName]: compressedImage,
      }));
    } catch (photoError) {
      console.error(
        "Vehicle photo error:",
        photoError
      );

      setError(
        photoError.message ||
        "Failed to process vehicle photo."
      );
    } finally {
      event.target.value = "";
    }
  };

  const removePhoto = (fieldName) => {
    setFormData((current) => ({
      ...current,
      [fieldName]: "",
    }));
  };

  /* =======================================================
     Submit reservation
     ======================================================= */

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
        throw new Error(
          "Please complete all reservation fields."
        );
      }

      const startTime =
        `${formData.date}T${formData.start}`;

      const endTime =
        `${formData.date}T${formData.end}`;

      if (
        new Date(endTime) <=
        new Date(startTime)
      ) {
        throw new Error(
          "End time must be after start time."
        );
      }

      /* ===================================================
         Reservation payload
         =================================================== */

      const reservationPayload = {
        customerId: Number(
          formData.customerId
        ),

        parkingSpaceId: Number(
          formData.parkingSpaceId
        ),

        startTime,
        endTime,

        // Vehicle inspection
        vehicleCondition:
          formData.vehicleCondition,

        vehicleNotes:
          formData.vehicleNotes.trim(),

        vehicleFrontPhoto:
          formData.vehicleFrontPhoto || null,

        vehicleRearPhoto:
          formData.vehicleRearPhoto || null,

        vehicleLeftPhoto:
          formData.vehicleLeftPhoto || null,

        vehicleRightPhoto:
          formData.vehicleRightPhoto || null,
      };

      /* ===================================================
         EDIT
         =================================================== */

      if (editingReservation) {
        const updatedReservation =
          await updateReservation(
            editingReservation.id,
            reservationPayload
          );

        setReservations((current) =>
          current.map((item) =>
            item.id ===
              updatedReservation.id
              ? {
                ...item,
                ...updatedReservation,
              }
              : item
          )
        );
      }

      /* ===================================================
         CREATE
         =================================================== */

      else {
        const newReservation =
          await createReservation(
            reservationPayload
          );

        setReservations((current) => [
          ...current,
          newReservation,
        ]);

        /*
         * New reservations normally start as
         * PENDING and require payment.
         */
        if (
          newReservation?.status ===
          "PENDING" &&
          newReservation?.paymentStatus ===
          "PENDING"
        ) {
          setPaymentReservation(
            newReservation
          );
        }
      }

      setEditingReservation(null);

      setFormData({
        ...emptyForm,
      });

      setShowForm(false);
    } catch (submitError) {
      console.error(
        "Reservation save error:",
        submitError
      );

      setError(
        submitError.message ||
        "Failed to save reservation."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     Cancel reservation
     ======================================================= */

  const handleDelete = async (
    reservation
  ) => {
    const confirmed = window.confirm(
      `Cancel reservation ${reservation.reservationCode ||
      `#${reservation.id}`
      }?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteReservation(
        reservation.id
      );

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
      console.error(
        "Delete reservation error:",
        deleteError
      );

      setError(
        deleteError.message ||
        "Failed to cancel reservation."
      );
    }
  };

  /* =======================================================
     Payment submitted
     ======================================================= */

  const handlePaymentSubmitted = (
    updatedReservation
  ) => {
    if (!updatedReservation) {
      setPaymentReservation(null);
      return;
    }

    setReservations((current) =>
      current.map((item) =>
        item.id ===
          updatedReservation.id
          ? {
            ...item,
            ...updatedReservation,
          }
          : item
      )
    );

    setPaymentReservation(null);
  };

  /* =======================================================
     Vehicle photo component
     ======================================================= */

  const VehiclePhotoInput = ({
    label,
    fieldName,
  }) => {
    const photo = formData[fieldName];

    return (
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          {label}
        </label>

        {photo ? (
          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <img
              src={photo}
              alt={`${label} vehicle`}
              className="h-40 w-full object-cover"
            />

            <button
              type="button"
              onClick={() =>
                removePhoto(fieldName)
              }
              className="absolute right-2 top-2 rounded-lg bg-red-600 p-2 text-white shadow-md transition hover:bg-red-700"
              title={`Remove ${label}`}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-2 text-xs font-medium text-white">
              {label} photo selected
            </div>
          </div>
        ) : (
          <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-blue-400 hover:bg-blue-50">
            <Camera className="mb-2 h-8 w-8 text-slate-400" />

            <span className="text-sm font-semibold text-slate-600">
              Upload {label}
            </span>

            <span className="mt-1 text-xs text-slate-400">
              JPG, PNG or WEBP
            </span>

            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(event) =>
                handlePhotoChange(
                  event,
                  fieldName
                )
              }
            />
          </label>
        )}
      </div>
    );
  };

  /* =======================================================
     Render
     ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-64 min-h-screen">
        <Navbar />

        <main className="p-6">
          {/* =================================================
              HEADER
              ================================================= */}

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
                    Manage parking reservations,
                    vehicle inspections and
                    payments
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

          {/* =================================================
              ERROR
              ================================================= */}

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
                onClick={() =>
                  setError("")
                }
                className="rounded-lg p-1 hover:bg-red-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* =================================================
              SUMMARY CARDS
              ================================================= */}

          <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                    (item) =>
                      item.status ===
                      "PENDING"
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
                    (item) =>
                      item.status ===
                      "CONFIRMED"
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
                    (item) =>
                      item.paymentStatus ===
                      "PAID"
                  ).length
                }
              </p>
            </div>
          </div>

          {/* =================================================
              SEARCH
              ================================================= */}

          <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search by reservation, customer, vehicle, parking or condition..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* =================================================
              TABLE
              ================================================= */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[1450px] w-full">
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
                      Car Condition
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
                  {/* LOADING */}

                  {loading ? (
                    <tr>
                      <td
                        colSpan="10"
                        className="px-5 py-16 text-center"
                      >
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                        <p className="mt-3 text-sm text-slate-500">
                          Loading reservations...
                        </p>
                      </td>
                    </tr>
                  ) : filteredReservations.length ===
                    0 ? (
                    /* EMPTY */

                    <tr>
                      <td
                        colSpan="10"
                        className="px-5 py-16 text-center"
                      >
                        <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />

                        <p className="mt-3 font-semibold text-slate-700">
                          No reservations found
                        </p>

                        <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500 sm:text-sm">
                          Create a new
                          reservation to
                          get started.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    /* DATA */

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

                        const hasPhotos =
                          Boolean(
                            reservation.vehicleFrontPhoto ||
                            reservation.vehicleRearPhoto ||
                            reservation.vehicleLeftPhoto ||
                            reservation.vehicleRightPhoto
                          );

                        return (
                          <tr
                            key={
                              reservation.id
                            }
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
                                    {
                                      reservation.totalAmount
                                    }
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

                            {/* Car Condition */}

                            <td className="px-5 py-4">
                              <div className="flex flex-col items-start gap-1">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getVehicleConditionClasses(
                                    reservation.vehicleCondition
                                  )}`}
                                >
                                  <CarFront className="h-3.5 w-3.5" />

                                  {getVehicleConditionLabel(
                                    reservation.vehicleCondition
                                  )}
                                </span>

                                {reservation.vehicleNotes && (
                                  <span
                                    className="max-w-[180px] truncate text-[11px] text-slate-400"
                                    title={
                                      reservation.vehicleNotes
                                    }
                                  >
                                    {
                                      reservation.vehicleNotes
                                    }
                                  </span>
                                )}

                                {hasPhotos && (
                                  <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-blue-600">
                                    <Camera className="h-3 w-3" />
                                    Photos recorded
                                  </span>
                                )}
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
                                {/* Pay */}

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

                                {/* Edit */}

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

                                {/* Cancel */}

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
        <div
          className="fixed inset-0 z-[99999] flex h-screen w-screen items-center justify-center bg-slate-950/60 p-3 backdrop-blur-[2px] sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <div
            className="relative flex w-full max-w-6xl max-h-[calc(100vh-24px)] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_25px_80px_rgba(15,23,42,0.35)] sm:max-h-[calc(100vh-32px)] sm:rounded-3xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* Header - stays visible while the form scrolls */}

            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-7 sm:py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800 sm:text-xl">
                  {editingReservation
                    ? "Edit Reservation"
                    : "New Reservation"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingReservation
                    ? "Update reservation and vehicle inspection details."
                    : "Create a parking reservation and record the vehicle condition upon entry."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="shrink-0 rounded-xl p-2.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6 lg:p-7"
            >
              {/* =================================================
                  BASIC RESERVATION INFORMATION
                  ================================================= */}

              <div className="mb-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-800">
                    Reservation Information
                  </h3>

                  <p className="text-sm text-slate-500">
                    Select the customer, parking
                    space and reservation time.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {/* Customer */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Customer
                    </label>

                    <select
                      name="customerId"
                      value={
                        formData.customerId
                      }
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">
                        Select customer
                      </option>

                      {customers.map(
                        (customer) => (
                          <option
                            key={
                              customer.id
                            }
                            value={
                              customer.id
                            }
                          >
                            {customer.name ||
                              customer.fullName ||
                              customer.customerName ||
                              `Customer #${customer.id}`}
                          </option>
                        )
                      )}
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

                  {/* Parking */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Parking Space
                    </label>

                    <select
                      name="parkingSpaceId"
                      value={
                        formData.parkingSpaceId
                      }
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">
                        Select parking space
                      </option>

                      {parkingSpaces.map(
                        (space) => (
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
                        )
                      )}
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
              </div>

              {/* =================================================
                  VEHICLE CONDITION
                  ================================================= */}

              <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50/50 p-5">
                <div className="mb-5 flex items-start gap-3">
                  <div className="rounded-xl bg-orange-100 p-3">
                    <CarFront className="h-6 w-6 text-orange-600" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      Vehicle Inspection Status
                      upon Entry
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Record the condition of the
                      vehicle before it enters the
                      parking area.
                    </p>
                  </div>
                </div>

                {/* Condition Status */}

                <div className="mb-5">
                  <label className="mb-3 block text-sm font-semibold text-slate-700">
                    Condition Status
                  </label>

                  <div className="grid gap-3 md:grid-cols-3">
                    {/* No Damage */}

                    <label
                      className={`cursor-pointer rounded-xl border-2 p-4 transition ${formData.vehicleCondition ===
                        "NO_DAMAGE"
                        ? "border-green-500 bg-green-50"
                        : "border-slate-200 bg-white hover:border-green-300"
                        }`}
                    >
                      <input
                        type="radio"
                        name="vehicleCondition"
                        value="NO_DAMAGE"
                        checked={
                          formData.vehicleCondition ===
                          "NO_DAMAGE"
                        }
                        onChange={handleChange}
                        className="sr-only"
                      />

                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-green-100 p-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            No damage
                          </p>

                          <p className="text-xs text-slate-500">
                            Vehicle appears
                            undamaged
                          </p>
                        </div>
                      </div>
                    </label>

                    {/* Minor Scratch */}

                    <label
                      className={`cursor-pointer rounded-xl border-2 p-4 transition ${formData.vehicleCondition ===
                        "MINOR_SCRATCH"
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-slate-200 bg-white hover:border-yellow-300"
                        }`}
                    >
                      <input
                        type="radio"
                        name="vehicleCondition"
                        value="MINOR_SCRATCH"
                        checked={
                          formData.vehicleCondition ===
                          "MINOR_SCRATCH"
                        }
                        onChange={handleChange}
                        className="sr-only"
                      />

                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-yellow-100 p-2">
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            Minor scratch
                          </p>

                          <p className="text-xs text-slate-500">
                            Small existing
                            marks
                          </p>
                        </div>
                      </div>
                    </label>

                    {/* Existing Body Damage */}

                    <label
                      className={`cursor-pointer rounded-xl border-2 p-4 transition ${formData.vehicleCondition ===
                        "EXISTING_BODY_DAMAGE"
                        ? "border-red-500 bg-red-50"
                        : "border-slate-200 bg-white hover:border-red-300"
                        }`}
                    >
                      <input
                        type="radio"
                        name="vehicleCondition"
                        value="EXISTING_BODY_DAMAGE"
                        checked={
                          formData.vehicleCondition ===
                          "EXISTING_BODY_DAMAGE"
                        }
                        onChange={handleChange}
                        className="sr-only"
                      />

                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-red-100 p-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            Existing body damage
                          </p>

                          <p className="text-xs text-slate-500">
                            Visible
                            pre-existing
                            damage
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Additional Notes */}

                <div className="mb-5">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Additional Notes
                  </label>

                  <textarea
                    name="vehicleNotes"
                    value={
                      formData.vehicleNotes
                    }
                    onChange={handleChange}
                    rows="3"
                    placeholder="Describe any pre-existing scratches, dents, broken lights, damaged mirrors or other visible conditions..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    Briefly describe any visible
                    pre-existing damage.
                  </p>
                </div>

                {/* Vehicle Photos */}

                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-slate-500" />

                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Vehicle Photos
                      </p>

                      <p className="text-xs text-slate-500">
                        Upload photos from the
                        front, rear and both
                        sides.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <VehiclePhotoInput
                      label="Front"
                      fieldName="vehicleFrontPhoto"
                    />

                    <VehiclePhotoInput
                      label="Rear"
                      fieldName="vehicleRearPhoto"
                    />

                    <VehiclePhotoInput
                      label="Left Side"
                      fieldName="vehicleLeftPhoto"
                    />

                    <VehiclePhotoInput
                      label="Right Side"
                      fieldName="vehicleRightPhoto"
                    />
                  </div>

                  <p className="mt-3 text-xs text-slate-400">
                    Photos are compressed in your
                    browser before being sent to the
                    server.
                  </p>
                </div>

                {/* Inspection Notice */}

                <div className="mt-5 flex items-start gap-3 rounded-xl border border-orange-200 bg-white p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Important inspection record
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Record the vehicle condition
                      before parking. This information
                      can be used to compare the vehicle
                      condition at departure and
                      document pre-existing damage.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  PAYMENT INFORMATION
                  ================================================= */}

              {!editingReservation && (
                <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex gap-3">
                    <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                    <div>
                      <p className="font-semibold text-blue-800">
                        Payment required
                      </p>

                      <p className="mt-1 text-sm text-blue-700">
                        After creating the reservation,
                        you will be asked to submit your
                        payment information. The
                        reservation remains pending until
                        payment is verified.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================
                  BUTTONS
                  ================================================= */}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
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
        <div className="fixed inset-0 z-[100000] flex h-screen w-screen items-center justify-center overflow-y-auto bg-slate-950/60 p-3 sm:p-4">
          <div className="flex w-full items-center justify-center py-2 sm:py-4">
            <div className="w-full max-w-2xl">
              <PaymentOptions
                reservation={
                  paymentReservation
                }
                onPaymentSubmitted={
                  handlePaymentSubmitted
                }
                onCancel={() =>
                  setPaymentReservation(null)
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}