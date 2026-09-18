function ParkingCard({
  number,
  status,
  onEdit,
  onDelete,
}) {
  const normalizedStatus = String(
    status || "available"
  ).toLowerCase();

  const statusConfig = {
    available: {
      label: "Available",
      icon: "✓",
      className: "available",
    },

    occupied: {
      label: "Occupied",
      icon: "🚘",
      className: "occupied",
    },

    reserved: {
      label: "Reserved",
      icon: "📅",
      className: "reserved",
    },

    maintenance: {
      label: "Maintenance",
      icon: "🔧",
      className: "maintenance",
    },
  };

  const currentStatus =
    statusConfig[normalizedStatus] ||
    statusConfig.available;

  return (
    <article className="parking-card">

      {/* CARD HEADER */}

      <div className="parking-card-header">

        <div className="parking-card-number-icon">
          P
        </div>

        <div className="parking-card-number">

          <span>
            Parking Space
          </span>

          <h3>
            {number}
          </h3>

        </div>

      </div>


      {/* STATUS */}

      <div className="parking-card-status">

        <span
          className={`parking-status-badge ${currentStatus.className}`}
        >
          <span>
            {currentStatus.icon}
          </span>

          {currentStatus.label}
        </span>

      </div>


      {/* CARD FOOTER */}

      <div className="parking-card-footer">

        <button
          type="button"
          className="parking-card-edit"
          onClick={onEdit}
        >
          <span>✏️</span>
          Edit
        </button>

        <button
          type="button"
          className="parking-card-delete"
          onClick={onDelete}
        >
          <span>🗑️</span>
          Delete
        </button>

      </div>

    </article>
  );
}

export default ParkingCard;