import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  CarFront,
  Search,
  UserRound,
} from "lucide-react";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/customers")
      .then((response) => response.json())
      .then((data) => {
        setCustomers(data.customers || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading customers:", error);
        setLoading(false);
      });
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const searchText = search.toLowerCase();

    return (
      customer.fullName?.toLowerCase().includes(searchText) ||
      customer.email?.toLowerCase().includes(searchText) ||
      customer.phone?.toLowerCase().includes(searchText) ||
      customer.carPlate?.toLowerCase().includes(searchText)
    );
  });

  const customersWithEmail = customers.filter(
    (customer) => customer.email
  ).length;

  const customersWithVehicle = customers.filter(
    (customer) => customer.carPlate
  ).length;

  return (
    <div className="customers-page">

      {/* HEADER */}
      <div className="customers-header">

        <div className="customers-title">
          <div className="customers-title-icon">
            <Users size={26} />
          </div>

          <div>
            <h1>Customers</h1>
            <p>Manage your parking customers</p>
          </div>
        </div>

        <button className="customer-add-btn">
          <UserPlus size={19} />
          <span>Add Customer</span>
        </button>

      </div>

      {/* SUMMARY CARDS */}
      <div className="customer-summary">

        <div className="customer-summary-card">
          <div className="customer-summary-icon blue">
            <Users size={23} />
          </div>

          <div>
            <p>Total Customers</p>
            <h3>{customers.length}</h3>
          </div>
        </div>

        <div className="customer-summary-card">
          <div className="customer-summary-icon green">
            <Mail size={23} />
          </div>

          <div>
            <p>With Email</p>
            <h3>{customersWithEmail}</h3>
          </div>
        </div>

        <div className="customer-summary-card">
          <div className="customer-summary-icon orange">
            <CarFront size={23} />
          </div>

          <div>
            <p>With Vehicle</p>
            <h3>{customersWithVehicle}</h3>
          </div>
        </div>

      </div>

      {/* SEARCH */}
      <div className="customers-toolbar">

        <div className="customer-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="customer-count">
          <Users size={17} />
          <span>{filteredCustomers.length} customers</span>
        </div>

      </div>

      {/* CONTENT */}
      {loading ? (

        <div className="customers-message">
          <div className="message-icon loading-icon">
            <Users size={32} />
          </div>

          <h2>Loading customers...</h2>
          <p>Please wait while we load the customer information.</p>
        </div>

      ) : customers.length === 0 ? (

        <div className="customers-message">

          <div className="message-icon">
            <Users size={38} />
          </div>

          <h2>No customers found</h2>

          <p>
            There are currently no customers in the system.
          </p>

          <button className="customer-add-btn">
            <UserPlus size={18} />
            <span>Add Your First Customer</span>
          </button>

        </div>

      ) : filteredCustomers.length === 0 ? (

        <div className="customers-message">

          <div className="message-icon">
            <Search size={36} />
          </div>

          <h2>No matching customers</h2>

          <p>
            Try searching with a different name, phone, email or plate number.
          </p>

        </div>

      ) : (

        <div className="customers-table-container">

          <table className="customers-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Contact</th>
                <th>Vehicle</th>
                <th>Car Plate</th>
              </tr>
            </thead>

            <tbody>

              {filteredCustomers.map((customer) => (

                <tr key={customer.id}>

                  <td>
                    <span className="customer-id">
                      #{customer.id}
                    </span>
                  </td>

                  <td>
                    <div className="customer-name">

                      <div className="customer-avatar">
                        <UserRound size={19} />
                      </div>

                      <div>
                        <strong>{customer.fullName}</strong>
                        <small>Parking Customer</small>
                      </div>

                    </div>
                  </td>

                  <td>
                    <div className="customer-contact">

                      {customer.phone && (
                        <div>
                          <Phone size={15} />
                          <span>{customer.phone}</span>
                        </div>
                      )}

                      {customer.email && (
                        <div>
                          <Mail size={15} />
                          <span>{customer.email}</span>
                        </div>
                      )}

                      {!customer.phone && !customer.email && (
                        <span className="no-data">No contact</span>
                      )}

                    </div>
                  </td>

                  <td>
                    <div className="vehicle-info">

                      <CarFront size={18} />

                      <span>
                        {customer.carModel || "No vehicle"}
                      </span>

                    </div>
                  </td>

                  <td>
                    {customer.carPlate ? (
                      <span className="plate-badge">
                        {customer.carPlate}
                      </span>
                    ) : (
                      <span className="no-data">-</span>
                    )}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}

export default Customers;

