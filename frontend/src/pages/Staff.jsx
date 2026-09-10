
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Staff() {
  const staff = [
    {
      id: 1,
      name: "Admin User",
      email: "admin@parking.com",
      role: "ADMIN",
    },
    {
      id: 2,
      name: "Parking Staff",
      email: "staff@parking.com",
      role: "STAFF",
    },
  ];

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

          <button className="btn btn-primary">
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

        <div className="table-container staff-table-container">
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
                    <button className="btn btn-secondary">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Staff;

