function ParkingCard({ number, status = "available", onEdit, onDelete }) {
  const statusLabel = status === "maintenance"
    ? "Maintenance"
    : `${status.charAt(0).toUpperCase()}${status.slice(1)}`;

  return (
    <div className={`parking-card ${status}`}>

      <div className="parking-number">
        {number}
      </div>

      <div>
        {statusLabel}
      </div>

      {(onEdit || onDelete) && (
        <div className="parking-card-actions">
          {onEdit && <button type="button" onClick={onEdit}>Edit</button>}
          {onDelete && <button type="button" onClick={onDelete}>Delete</button>}
        </div>
      )}

    </div>
  );
}

export default ParkingCard;