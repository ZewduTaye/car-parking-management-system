import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";

import {
  createStaff,
  deleteStaff,
  getStaff,
  updateStaff,
} from "../Services/api";

const emptyForm = {
  name: "",
  email: "",
  role: "STAFF",
  password: "",
};

function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // ============================================================
  // LOAD STAFF
  // ============================================================
  useEffect(() => {
    const loadStaff = async () => {
      try {
        setError("");

        const data = await getStaff();

        setStaff(Array.isArray(data) ? data : []);
      } catch (loadError) {
        console.error("Failed to load staff:", loadError);
        setError(loadError.message || "Failed to load staff.");
      } finally {
        setLoading(false);
      }
    };

    loadStaff();
  }, []);

  // ============================================================
  // OPEN CREATE MODAL
  // ============================================================
  const openCreateModal = () => {
    setEditingStaff(null);
    setForm({ ...emptyForm });
    setError("");
    setIsModalOpen(true);
  };

  // ============================================================
  // OPEN EDIT MODAL
  // ============================================================
  const openEditModal = (person) => {
    setEditingStaff(person);

    setForm({
      name: person.name || "",
      email: person.email || "",
      role: person.role || "STAFF",
      password: "",
    });

    setError("");
    setIsModalOpen(true);
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================
  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingStaff(null);
    setForm({ ...emptyForm });
    setError("");
  };

  // ============================================================
  // HANDLE FORM CHANGE
  // ============================================================
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // ============================================================
  // CREATE / UPDATE STAFF
  // ============================================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Please enter the staff name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter the staff email.");
      return;
    }

    if (!editingStaff && form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      let savedStaff;

      if (editingStaff) {
        // When editing, don't send an empty password.
        const updateData = {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
        };

        if (form.password.trim()) {
          updateData.password = form.password;
        }

        savedStaff = await updateStaff(editingStaff.id, updateData);

        setStaff((current) =>
          current.map((person) =>
            person.id === savedStaff.id ? savedStaff : person
          )
        );
      } else {
        const createData = {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          password: form.password,
        };

        savedStaff = await createStaff(createData);

        setStaff((current) => [savedStaff, ...current]);
      }

      closeModal();
    } catch (saveError) {
      console.error("Failed to save staff:", saveError);

      setError(
        saveError.message ||
        `Failed to ${editingStaff ? "update" : "create"} staff.`
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DELETE STAFF
  // ============================================================
  const handleDelete = async (person) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${person.name}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteStaff(person.id);

      setStaff((current) =>
        current.filter((item) => item.id !== person.id)
      );
    } catch (deleteError) {
      console.error("Failed to delete staff:", deleteError);

      setError(deleteError.message || "Failed to delete staff.");
    }
  };

  // ============================================================
  // COUNTS
  // ============================================================
  const adminCount = staff.filter(
    (person) => person.role === "ADMIN"
  ).length;

  const parkingStaffCount = staff.filter(
    (person) => person.role === "STAFF"
  ).length;

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Navbar title="Staff Management" />

        {/* ======================================================
            PAGE HEADER
        ====================================================== */}
        <div
          className="page-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "28px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "32px",
                fontWeight: "700",
                color: "#172033",
              }}
            >
              👨‍💼 Staff Management
            </h1>

            <p
              style={{
                marginTop: "8px",
                marginBottom: 0,
                color: "#718096",
                fontSize: "15px",
              }}
            >
              Manage administrators and parking staff
            </p>
          </div>

          {/* ADD STAFF BUTTON */}
          <button
            type="button"
            onClick={openCreateModal}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "9px",
              minWidth: "145px",
              height: "48px",
              padding: "0 20px",
              border: "none",
              borderRadius: "12px",
              background:
                "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(37, 99, 235, 0.25)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.transform = "translateY(-2px)";
              event.currentTarget.style.boxShadow =
                "0 12px 25px rgba(37, 99, 235, 0.35)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = "translateY(0)";
              event.currentTarget.style.boxShadow =
                "0 8px 20px rgba(37, 99, 235, 0.25)";
            }}
          >
            <span style={{ fontSize: "21px", lineHeight: 1 }}>＋</span>
            Add Staff
          </button>
        </div>

        {/* ======================================================
            ERROR MESSAGE
        ====================================================== */}
        {error && staff.length > 0 && (
          <div
            role="alert"
            style={{
              marginBottom: "20px",
              padding: "14px 18px",
              borderRadius: "10px",
              background: "#fff5f5",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              fontSize: "14px",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* ======================================================
            SUMMARY CARDS
        ====================================================== */}
        <div className="staff-summary">
          {/* TOTAL STAFF */}
          <div className="staff-summary-card">
            <span
              style={{
                width: "58px",
                height: "58px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "16px",
                background: "#eff6ff",
                fontSize: "30px",
              }}
            >
              👥
            </span>

            <div>
              <p>Total Staff</p>
              <h3>{staff.length}</h3>
            </div>
          </div>

          {/* ADMINISTRATORS */}
          <div className="staff-summary-card">
            <span
              style={{
                width: "58px",
                height: "58px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "16px",
                background: "#fff7ed",
                fontSize: "30px",
              }}
            >
              👑
            </span>

            <div>
              <p>Administrators</p>
              <h3>{adminCount}</h3>
            </div>
          </div>

          {/* PARKING STAFF */}
          <div className="staff-summary-card">
            <span
              style={{
                width: "58px",
                height: "58px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "16px",
                background: "#f0fdf4",
                fontSize: "30px",
              }}
            >
              🅿️
            </span>

            <div>
              <p>Parking Staff</p>
              <h3>{parkingStaffCount}</h3>
            </div>
          </div>
        </div>

        {/* ======================================================
            LOADING
        ====================================================== */}
        {loading ? (
          <div
            className="customers-message"
            style={{
              padding: "60px 20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "38px",
                marginBottom: "12px",
              }}
            >
              ⏳
            </div>

            <h2>Loading staff...</h2>

            <p>Please wait while staff information is loaded.</p>
          </div>
        ) : error && staff.length === 0 ? (
          /* ====================================================
             ERROR
          ==================================================== */
          <div
            className="customers-message"
            style={{
              padding: "60px 20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "45px",
                marginBottom: "10px",
              }}
            >
              ⚠️
            </div>

            <h2>Unable to load staff</h2>

            <p>{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                marginTop: "15px",
                padding: "11px 20px",
                border: "none",
                borderRadius: "10px",
                background: "#2563eb",
                color: "#fff",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        ) : staff.length === 0 ? (
          /* ====================================================
             EMPTY STATE
          ==================================================== */
          <div
            className="customers-message"
            style={{
              padding: "70px 20px",
              textAlign: "center",
              background: "#ffffff",
              borderRadius: "18px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                fontSize: "55px",
                marginBottom: "12px",
              }}
            >
              👨‍💼
            </div>

            <h2>No staff found</h2>

            <p>Create your first staff member to get started.</p>

            <button
              type="button"
              onClick={openCreateModal}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "18px",
                padding: "13px 22px",
                border: "none",
                borderRadius: "11px",
                background:
                  "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "#fff",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 7px 18px rgba(37, 99, 235, 0.25)",
              }}
            >
              ＋ Add Staff
            </button>
          </div>
        ) : (
          /* ====================================================
             STAFF TABLE
          ==================================================== */
          <div
            className="table-container staff-table-container"
            style={{
              overflowX: "auto",
              background: "#ffffff",
              borderRadius: "18px",
              border: "1px solid #e8edf5",
              boxShadow: "0 8px 30px rgba(15, 23, 42, 0.06)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "800px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f8fafc",
                  }}
                >
                  <th
                    style={{
                      padding: "18px 20px",
                      textAlign: "left",
                      color: "#64748b",
                      fontSize: "13px",
                      fontWeight: "700",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    ID
                  </th>

                  <th
                    style={{
                      padding: "18px 20px",
                      textAlign: "left",
                      color: "#64748b",
                      fontSize: "13px",
                      fontWeight: "700",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    NAME
                  </th>

                  <th
                    style={{
                      padding: "18px 20px",
                      textAlign: "left",
                      color: "#64748b",
                      fontSize: "13px",
                      fontWeight: "700",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    EMAIL
                  </th>

                  <th
                    style={{
                      padding: "18px 20px",
                      textAlign: "left",
                      color: "#64748b",
                      fontSize: "13px",
                      fontWeight: "700",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    ROLE
                  </th>

                  <th
                    style={{
                      padding: "18px 20px",
                      textAlign: "left",
                      color: "#64748b",
                      fontSize: "13px",
                      fontWeight: "700",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    ACTIONS
                  </th>
                </tr>
              </thead>

              <tbody>
                {staff.map((person) => (
                  <tr
                    key={person.id}
                    style={{
                      borderBottom: "1px solid #eef2f7",
                    }}
                  >
                    {/* ID */}
                    <td
                      style={{
                        padding: "18px 20px",
                        color: "#64748b",
                        fontWeight: "600",
                      }}
                    >
                      #{person.id}
                    </td>

                    {/* NAME */}
                    <td
                      style={{
                        padding: "18px 20px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <span
                          style={{
                            width: "42px",
                            height: "42px",
                            minWidth: "42px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background:
                              "linear-gradient(135deg, #dbeafe, #bfdbfe)",
                            color: "#1d4ed8",
                            fontWeight: "800",
                            fontSize: "16px",
                            textTransform: "uppercase",
                          }}
                        >
                          {(person.name || "?").charAt(0)}
                        </span>

                        <div>
                          <div
                            style={{
                              fontWeight: "700",
                              color: "#1e293b",
                              fontSize: "14px",
                            }}
                          >
                            {person.name}
                          </div>

                          <div
                            style={{
                              color: "#94a3b8",
                              fontSize: "12px",
                              marginTop: "3px",
                            }}
                          >
                            Staff member
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* EMAIL */}
                    <td
                      style={{
                        padding: "18px 20px",
                        color: "#475569",
                        fontSize: "14px",
                      }}
                    >
                      {person.email}
                    </td>

                    {/* ROLE */}
                    <td
                      style={{
                        padding: "18px 20px",
                      }}
                    >
                      <span
                        className={
                          person.role === "ADMIN"
                            ? "staff-role staff-admin"
                            : "staff-role staff-member"
                        }
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "7px 12px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          fontWeight: "800",
                          letterSpacing: "0.3px",
                          background:
                            person.role === "ADMIN"
                              ? "#fff7ed"
                              : "#ecfdf5",
                          color:
                            person.role === "ADMIN"
                              ? "#c2410c"
                              : "#047857",
                          border:
                            person.role === "ADMIN"
                              ? "1px solid #fed7aa"
                              : "1px solid #a7f3d0",
                        }}
                      >
                        {person.role === "ADMIN" ? "👑 " : "🅿️ "}
                        {person.role}
                      </span>
                    </td>

                    {/* ACTION BUTTONS */}
                    <td
                      style={{
                        padding: "18px 20px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "9px",
                        }}
                      >
                        {/* EDIT */}
                        <button
                          type="button"
                          onClick={() => openEditModal(person)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            minWidth: "78px",
                            height: "38px",
                            padding: "0 13px",
                            borderRadius: "9px",
                            border: "1px solid #bfdbfe",
                            background: "#eff6ff",
                            color: "#2563eb",
                            fontSize: "13px",
                            fontWeight: "700",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(event) => {
                            event.currentTarget.style.background = "#2563eb";
                            event.currentTarget.style.color = "#ffffff";
                          }}
                          onMouseLeave={(event) => {
                            event.currentTarget.style.background = "#eff6ff";
                            event.currentTarget.style.color = "#2563eb";
                          }}
                        >
                          ✏️ Edit
                        </button>

                        {/* DELETE */}
                        <button
                          type="button"
                          onClick={() => handleDelete(person)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            minWidth: "85px",
                            height: "38px",
                            padding: "0 13px",
                            borderRadius: "9px",
                            border: "1px solid #fecaca",
                            background: "#fff1f2",
                            color: "#dc2626",
                            fontSize: "13px",
                            fontWeight: "700",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(event) => {
                            event.currentTarget.style.background = "#dc2626";
                            event.currentTarget.style.color = "#ffffff";
                          }}
                          onMouseLeave={(event) => {
                            event.currentTarget.style.background = "#fff1f2";
                            event.currentTarget.style.color = "#dc2626";
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ======================================================
            ADD / EDIT STAFF MODAL
        ====================================================== */}
        <Modal
          isOpen={isModalOpen}
          title={editingStaff ? "Edit Staff Member" : "Add New Staff"}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit}>
            {/* NAME */}
            <label>
              Name

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </label>

            {/* EMAIL */}
            <label>
              Email

              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
                required
              />
            </label>

            {/* ROLE */}
            <label>
              Role

              <select
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="STAFF">STAFF</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </label>

            {/* PASSWORD */}
            <label>
              Password{" "}
              {editingStaff && "(leave blank to keep current)"}

              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder={
                  editingStaff
                    ? "Leave blank to keep current password"
                    : "Minimum 8 characters"
                }
                required={!editingStaff}
                minLength="8"
              />
            </label>

            {/* ERROR INSIDE MODAL */}
            {error && (
              <p
                role="alert"
                style={{
                  margin: "12px 0",
                  padding: "11px 13px",
                  borderRadius: "8px",
                  background: "#fff1f2",
                  color: "#be123c",
                  fontSize: "13px",
                }}
              >
                ⚠️ {error}
              </p>
            )}

            {/* MODAL ACTIONS */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                style={{
                  height: "44px",
                  padding: "0 18px",
                  borderRadius: "9px",
                  border: "1px solid #dbe2ea",
                  background: "#ffffff",
                  color: "#475569",
                  fontWeight: "600",
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>

              <button
                className="btn btn-primary"
                type="submit"
                disabled={saving}
                style={{
                  minWidth: "145px",
                  height: "44px",
                  border: "none",
                  borderRadius: "9px",
                  background: saving
                    ? "#93c5fd"
                    : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  color: "#ffffff",
                  fontWeight: "700",
                  cursor: saving ? "not-allowed" : "pointer",
                  boxShadow: "0 6px 15px rgba(37, 99, 235, 0.2)",
                }}
              >
                {saving
                  ? "Saving..."
                  : editingStaff
                    ? "Save Changes"
                    : "Create Staff"}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}

export default Staff;