function ParkingCard({ number, status = "available" }) {
  return (
    <div className={`parking-card ${status}`}>

      <div className="parking-number">
        {number}
      </div>

      <div>
        {status === "available" && "Available"}
        {status === "occupied" && "Occupied"}
        {status === "reserved" && "Reserved"}
      </div>

    </div>
  );
}

export default ParkingCard;