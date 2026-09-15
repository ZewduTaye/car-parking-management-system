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

  useEffect(() => {
    const loadSpaces = async () => {
      try {
        setError("");
        setSpaces(await getParkingSpaces());
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    loadSpaces();
  }, []);

  const openCreateModal = () => {
    setEditingSpace(null);
    setForm(emptyForm);
    setError("");
    setIsModalOpen(true);
  };

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

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const savedSpace = editingSpace
        ? await updateParkingSpace(editingSpace.id, form)
        : await createParkingSpace(form);

      setSpaces((current) => {
        if (!editingSpace) {
          return [...current, savedSpace].sort((left, right) =>
            left.spaceNumber.localeCompare(right.spaceNumber)
          );
        }

        return current.map((space) =>
          space.id === savedSpace.id ? savedSpace : space
        );
      });
      setIsModalOpen(false);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (space) => {
    if (!window.confirm(`Delete parking space ${space.spaceNumber}?`)) {
      return;
    }

    try {
      setError("");
      await deleteParkingSpace(space.id);
      setSpaces((current) => current.filter((item) => item.id !== space.id));
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const countByStatus = (status) =>
    spaces.filter((space) => space.status === status).length;

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Navbar title="Parking Spaces" />

        <div className="page-header">
          <div>
            <h1>🅿️ Parking Spaces</h1>
            <p>Monitor parking space availability</p>
          </div>

          <button className="btn btn-primary" onClick={openCreateModal}>
            + Add Space
          </button>
        </div>

        <div className="parking-summary">
          <div className="parking-summary-card"><span>🅿️</span><div><p>Total</p><h3>{spaces.length}</h3></div></div>
          <div className="parking-summary-card"><span>✅</span><div><p>Available</p><h3>{countByStatus("AVAILABLE")}</h3></div></div>
          <div className="parking-summary-card"><span>🚘</span><div><p>Occupied</p><h3>{countByStatus("OCCUPIED")}</h3></div></div>
          <div className="parking-summary-card"><span>📅</span><div><p>Reserved</p><h3>{countByStatus("RESERVED")}</h3></div></div>
        </div>

        {loading ? (
          <div className="customers-message"><h2>Loading parking spaces...</h2></div>
        ) : error && spaces.length === 0 ? (
          <div className="customers-message"><h2>Unable to load parking spaces</h2><p>{error}</p></div>
        ) : spaces.length === 0 ? (
          <div className="customers-message"><h2>No parking spaces found</h2><p>Add the first parking space to begin.</p><button className="btn btn-primary" onClick={openCreateModal}>+ Add Space</button></div>
        ) : (
          <div className="parking-grid">
            {spaces.map((space) => (
              <ParkingCard
                key={space.id}
                number={space.spaceNumber}
                status={space.status.toLowerCase()}
                onEdit={() => openEditModal(space)}
                onDelete={() => handleDelete(space)}
              />
            ))}
          </div>
        )}

        {error && spaces.length > 0 && <p role="alert">{error}</p>}

        <Modal
          isOpen={isModalOpen}
          title={editingSpace ? "Edit Parking Space" : "Add Parking Space"}
          onClose={() => !saving && setIsModalOpen(false)}
        >
          <form onSubmit={handleSubmit}>
            <label>Space number<input name="spaceNumber" value={form.spaceNumber} onChange={handleChange} required /></label>
            <label>Location<input name="location" value={form.location} onChange={handleChange} /></label>
            <label>Status<select name="status" value={form.status} onChange={handleChange}><option value="AVAILABLE">Available</option><option value="OCCUPIED">Occupied</option><option value="RESERVED">Reserved</option><option value="MAINTENANCE">Maintenance</option></select></label>
            <label>Price per hour<input name="pricePerHour" type="number" min="0" step="0.01" value={form.pricePerHour} onChange={handleChange} /></label>
            <label><input name="isVIP" type="checkbox" checked={form.isVIP} onChange={handleChange} /> VIP space</label>
            {error && <p role="alert">{error}</p>}
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Saving..." : editingSpace ? "Save Changes" : "Create Space"}</button>
          </form>
        </Modal>
      </main>
    </div>
  );
}

export default ParkingSpaces;
