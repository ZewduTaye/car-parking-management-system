import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ParkingCard from "../components/ParkingCard";
import Modal from "../components/Modal";

import {
  createParkingSpace,
  deleteParkingSpace,
  getParkingSpaces,
  updateParkingSpace,
} from "../Services/api";

const emptyForm = {
  spaceNumber: "",
  location: "",
  status: "AVAILABLE",
  isVIP: false,
  pricePerHour: "0",
};

function ParkingSpaces() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // =========================================================
  // LOAD PARKING SPACES
  // =========================================================

  useEffect(() => {
    const loadSpaces = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getParkingSpaces();

        setSpaces(Array.isArray(data) ? data : []);
      } catch (loadError) {
        console.error("Error loading parking spaces:", loadError);
        setError(loadError.message || "Failed to load parking spaces.");
      } finally {
        setLoading(false);
      }
    };

    loadSpaces();
  }, []);

  // =========================================================
  // OPEN CREATE MODAL
  // =========================================================

  const openCreateModal = () => {
    setEditingSpace(null);
    setForm(emptyForm);
    setError("");
    setIsModalOpen(true);
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const openEditModal = (space) => {
    setEditingSpace(space);

    setForm({
      spaceNumber: space.spaceNumber || "",
      location: space.location || "",
      status: space.status || "AVAILABLE",
      isVIP: Boolean(space.isVIP),
      pricePerHour: String(space.pricePerHour ?? 0),
    });

    setError("");
    setIsModalOpen(true);
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================================================
  // CREATE / UPDATE
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      let savedSpace;

      if (editingSpace) {
        savedSpace = await updateParkingSpace(
          editingSpace.id,
          form
        );
      } else {
        savedSpace = await createParkingSpace(form);
      }

      setSpaces((current) => {
        if (!editingSpace) {
          return [...current, savedSpace].sort((left, right) =>
            String(left.spaceNumber).localeCompare(
              String(right.spaceNumber),
              undefined,
              { numeric: true }
            )
          );
        }

        return current.map((space) =>
          space.id === savedSpace.id
            ? savedSpace
            : space
        );
      });

      setIsModalOpen(false);
      setEditingSpace(null);
      setForm(emptyForm);
    } catch (saveError) {
      console.error("Error saving parking space:", saveError);

      setError(
        saveError.message || "Failed to save parking space."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (space) => {
    const confirmed = window.confirm(
      `Delete parking space ${space.spaceNumber}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteParkingSpace(space.id);

      setSpaces((current) =>
        current.filter((item) => item.id !== space.id)
      );
    } catch (deleteError) {
      console.error("Error deleting parking space:", deleteError);

      setError(
        deleteError.message ||
        "Failed to delete parking space."
      );
    }
  };

  // =========================================================
  // STATUS COUNTS
  // =========================================================

  const countByStatus = (status) => {
    return spaces.filter(
      (space) => space.status === status
    ).length;
  };

  const totalSpaces = spaces.length;
  const availableSpaces = countByStatus("AVAILABLE");
  const occupiedSpaces = countByStatus("OCCUPIED");
  const reservedSpaces = countByStatus("RESERVED");

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="app-layout parking-page">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="main-content">

        {/* NAVBAR */}
        <Navbar title="Parking Spaces" />

        {/* ===================================================
            PAGE HEADER
        =================================================== */}

        <section className="parking-page-header">

          <div className="parking-page-title">

            <div className="parking-title-icon">
              🅿️
            </div>

            <div>
              <h1>Parking Spaces</h1>

              <p>
                Monitor and manage parking space availability
              </p>
            </div>

          </div>

          {/* ADD SPACE BUTTON */}

          <button
            type="button"
            className="parking-add-button"
            onClick={openCreateModal}
          >
            <span className="parking-add-icon">
              +
            </span>

            <span>
              Add Space
            </span>
          </button>

        </section>

        {/* ===================================================
            ERROR MESSAGE
        =================================================== */}

        {error && spaces.length > 0 && (
          <div className="parking-error" role="alert">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* ===================================================
            SUMMARY CARDS
        =================================================== */}

        <section className="parking-summary">

          {/* TOTAL */}

          <div className="parking-summary-card total-card">

            <div className="parking-summary-icon blue">
              🅿️
            </div>

            <div className="parking-summary-content">

              <p>Total Spaces</p>

              <h3>{totalSpaces}</h3>

              <span>
                All parking spaces
              </span>

            </div>

          </div>

          {/* AVAILABLE */}

          <div className="parking-summary-card available-card">

            <div className="parking-summary-icon green">
              ✓
            </div>

            <div className="parking-summary-content">

              <p>Available</p>

              <h3>{availableSpaces}</h3>

              <span>
                Ready for parking
              </span>

            </div>

          </div>

          {/* OCCUPIED */}

          <div className="parking-summary-card occupied-card">

            <div className="parking-summary-icon orange">
              🚘
            </div>

            <div className="parking-summary-content">

              <p>Occupied</p>

              <h3>{occupiedSpaces}</h3>

              <span>
                Currently occupied
              </span>

            </div>

          </div>

          {/* RESERVED */}

          <div className="parking-summary-card reserved-card">

            <div className="parking-summary-icon purple">
              📅
            </div>

            <div className="parking-summary-content">

              <p>Reserved</p>

              <h3>{reservedSpaces}</h3>

              <span>
                Upcoming reservations
              </span>

            </div>

          </div>

        </section>

        {/* ===================================================
            LOADING
        =================================================== */}

        {loading && (
          <div className="parking-empty-state">

            <div className="parking-loading-icon">
              ⏳
            </div>

            <h2>
              Loading parking spaces...
            </h2>

            <p>
              Please wait while we retrieve your parking spaces.
            </p>

          </div>
        )}

        {/* ===================================================
            ERROR / NO DATA
        =================================================== */}

        {!loading &&
          error &&
          spaces.length === 0 && (
            <div className="parking-empty-state error-state">

              <div className="parking-empty-icon">
                ⚠️
              </div>

              <h2>
                Unable to load parking spaces
              </h2>

              <p>
                {error}
              </p>

              <button
                type="button"
                className="parking-add-button"
                onClick={openCreateModal}
              >
                <span className="parking-add-icon">
                  +
                </span>

                Add Space
              </button>

            </div>
          )}

        {/* ===================================================
            NO PARKING SPACES
        =================================================== */}

        {!loading &&
          !error &&
          spaces.length === 0 && (
            <div className="parking-empty-state">

              <div className="parking-empty-icon">
                🅿️
              </div>

              <h2>
                No parking spaces yet
              </h2>

              <p>
                Add your first parking space to begin managing
                your parking area.
              </p>

              <button
                type="button"
                className="parking-add-button"
                onClick={openCreateModal}
              >
                <span className="parking-add-icon">
                  +
                </span>

                Add First Space
              </button>

            </div>
          )}

        {/* ===================================================
            PARKING SPACE GRID
        =================================================== */}

        {!loading && spaces.length > 0 && (
          <section className="parking-spaces-section">

            <div className="parking-section-header">

              <div>
                <h2>
                  All Parking Spaces
                </h2>

                <p>
                  {spaces.length}{" "}
                  {spaces.length === 1
                    ? "space"
                    : "spaces"}{" "}
                  registered
                </p>
              </div>

              <button
                type="button"
                className="parking-small-add-button"
                onClick={openCreateModal}
              >
                <span>+</span>
                Add Space
              </button>

            </div>

            <div className="parking-grid">

              {spaces.map((space) => (
                <ParkingCard
                  key={space.id}
                  number={space.spaceNumber}
                  status={
                    String(space.status || "AVAILABLE")
                      .toLowerCase()
                  }
                  onEdit={() =>
                    openEditModal(space)
                  }
                  onDelete={() =>
                    handleDelete(space)
                  }
                />
              ))}

            </div>

          </section>
        )}

        {/* ===================================================
            MODAL
        =================================================== */}

        <Modal
          isOpen={isModalOpen}
          title={
            editingSpace
              ? "Edit Parking Space"
              : "Add Parking Space"
          }
          onClose={() =>
            !saving &&
            setIsModalOpen(false)
          }
        >

          <form
            className="parking-form"
            onSubmit={handleSubmit}
          >

            {/* SPACE NUMBER */}

            <div className="parking-form-group">

              <label htmlFor="spaceNumber">
                Space Number
              </label>

              <input
                id="spaceNumber"
                name="spaceNumber"
                type="text"
                placeholder="Example: 150"
                value={form.spaceNumber}
                onChange={handleChange}
                required
              />

            </div>

            {/* LOCATION */}

            <div className="parking-form-group">

              <label htmlFor="location">
                Location
              </label>

              <input
                id="location"
                name="location"
                type="text"
                placeholder="Example: Ground Floor"
                value={form.location}
                onChange={handleChange}
              />

            </div>

            {/* STATUS */}

            <div className="parking-form-group">

              <label htmlFor="status">
                Status
              </label>

              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="AVAILABLE">
                  Available
                </option>

                <option value="OCCUPIED">
                  Occupied
                </option>

                <option value="RESERVED">
                  Reserved
                </option>

                <option value="MAINTENANCE">
                  Maintenance
                </option>
              </select>

            </div>

            {/* PRICE */}

            <div className="parking-form-group">

              <label htmlFor="pricePerHour">
                Price Per Hour
              </label>

              <div className="price-input-wrapper">

                <span>
                  ETB
                </span>

                <input
                  id="pricePerHour"
                  name="pricePerHour"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.pricePerHour}
                  onChange={handleChange}
                />

              </div>

            </div>

            {/* VIP */}

            <label className="vip-checkbox">

              <input
                name="isVIP"
                type="checkbox"
                checked={form.isVIP}
                onChange={handleChange}
              />

              <span className="vip-checkmark">
                ⭐
              </span>

              <span>
                VIP Parking Space
              </span>

            </label>

            {/* MODAL ERROR */}

            {error && (
              <div
                className="parking-form-error"
                role="alert"
              >
                ⚠️ {error}
              </div>
            )}

            {/* FORM BUTTONS */}

            <div className="parking-form-actions">

              <button
                type="button"
                className="parking-cancel-button"
                onClick={() =>
                  !saving &&
                  setIsModalOpen(false)
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="parking-save-button"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="button-spinner">
                      ⏳
                    </span>

                    Saving...
                  </>
                ) : (
                  <>
                    <span>
                      ✓
                    </span>

                    {editingSpace
                      ? "Save Changes"
                      : "Create Space"}
                  </>
                )}
              </button>

            </div>

          </form>

        </Modal>

      </main>

    </div>
  );
}

export default ParkingSpaces;