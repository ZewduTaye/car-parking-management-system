
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";
import { createStaff, deleteStaff, getStaff, updateStaff } from "../Services/api";

const emptyForm = { name: "", email: "", role: "STAFF", password: "" };

function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadStaff = async () => {
      try {
        setStaff(await getStaff());
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };
    loadStaff();
  }, []);

  const openCreateModal = () => {
    setEditingStaff(null);
    setForm(emptyForm);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (person) => {
    setEditingStaff(person);
    setForm({ name: person.name, email: person.email, role: person.role, password: "" });
    setError("");
    setIsModalOpen(true);
  };

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const savedStaff = editingStaff
        ? await updateStaff(editingStaff.id, form)
        : await createStaff(form);
      setStaff((current) => editingStaff
        ? current.map((person) => person.id === savedStaff.id ? savedStaff : person)
        : [savedStaff, ...current]
      );
      setIsModalOpen(false);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (person) => {
    if (!window.confirm(`Delete ${person.name}?`)) return;
    try {
      setError("");
      await deleteStaff(person.id);
      setStaff((current) => current.filter((item) => item.id !== person.id));
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Navbar title="Staff Management" />

        <div className="page-header">
          <div>
            <h1>👨‍💼 Staff Management</h1>
            <p>Manage administrators and parking staff</p>
          </div>

          <button className="btn btn-primary" onClick={openCreateModal}>
            + Add Staff
          </button>
        </div>

        <div className="staff-summary">
          <div className="staff-summary-card">
            <span>👥</span>
            <div>
              <p>Total Staff</p>
              <h3>{staff.length}</h3>
            </div>
          </div>

          <div className="staff-summary-card">
            <span>👑</span>
            <div>
              <p>Administrators</p>
              <h3>
                {staff.filter((person) => person.role === "ADMIN").length}
              </h3>
            </div>
          </div>

          <div className="staff-summary-card">
            <span>🅿️</span>
            <div>
              <p>Parking Staff</p>
              <h3>
                {staff.filter((person) => person.role === "STAFF").length}
              </h3>
            </div>
          </div>
        </div>

        {loading ? <div className="customers-message"><h2>Loading staff...</h2></div> : error && staff.length === 0 ? <div className="customers-message"><h2>Unable to load staff</h2><p>{error}</p></div> : staff.length === 0 ? <div className="customers-message"><h2>No staff found</h2><button className="btn btn-primary" onClick={openCreateModal}>+ Add Staff</button></div> : <div className="table-container staff-table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {staff.map((person) => (
                <tr key={person.id}>
                  <td>{person.id}</td>

                  <td>
                    <div className="staff-name">
                      <span className="staff-avatar">
                        {person.name.charAt(0)}
                      </span>
                      <span>{person.name}</span>
                    </div>
                  </td>

                  <td>{person.email}</td>

                  <td>
                    <span
                      className={`staff-role ${
                        person.role === "ADMIN"
                          ? "staff-admin"
                          : "staff-member"
                      }`}
                    >
                      {person.role}
                    </span>
                  </td>

                  <td>
                    <button className="btn btn-secondary" onClick={() => openEditModal(person)}>Edit</button>
                    <button className="btn btn-secondary" onClick={() => handleDelete(person)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
        {error && staff.length > 0 && <p role="alert">{error}</p>}

        <Modal
          isOpen={isModalOpen}
          title={editingStaff ? "Edit Staff" : "Add Staff"}
          onClose={() => !saving && setIsModalOpen(false)}
        >
          <form onSubmit={handleSubmit}>
            <label>Name<input name="name" value={form.name} onChange={handleChange} required /></label>
            <label>Email<input name="email" type="email" value={form.email} onChange={handleChange} required /></label>
            <label>Role<select name="role" value={form.role} onChange={handleChange}><option value="STAFF">STAFF</option><option value="ADMIN">ADMIN</option></select></label>
            <label>Password{editingStaff && " (leave blank to keep current)"}<input name="password" type="password" value={form.password} onChange={handleChange} required={!editingStaff} minLength="8" /></label>
            {error && <p role="alert">{error}</p>}
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Saving..." : editingStaff ? "Save Changes" : "Create Staff"}</button>
          </form>
        </Modal>
      </main>
    </div>
  );
}

export default Staff;

