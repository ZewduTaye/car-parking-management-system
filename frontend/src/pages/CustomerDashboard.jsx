import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
    CarFront,
    MapPin,
    CreditCard,
    Clock3,
    CalendarDays,
    ArrowRight,
    Search,
    ParkingSquare,
    ShieldCheck,
    LogOut,
    User,
    Bell,
    ChevronRight,
    CheckCircle2,
    CircleParking,
    Star,
} from "lucide-react";

import {
    getCurrentUser,
    getParkingSpaces,
    getReservations,
    logoutUser,
} from "../Services/api";

function CustomerDashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [spaces, setSpaces] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [userData, spacesData, reservationsData] =
                    await Promise.all([
                        getCurrentUser().catch(() => null),
                        getParkingSpaces().catch(() => []),
                        getReservations().catch(() => []),
                    ]);

                setUser(userData);
                setSpaces(Array.isArray(spacesData) ? spacesData : []);
                setReservations(
                    Array.isArray(reservationsData) ? reservationsData : []
                );
            } catch (error) {
                console.error("Customer dashboard error:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    const displayName = useMemo(() => {
        const storedUser = localStorage.getItem("user");

        if (user?.name) return user.name;

        if (user?.fullName) return user.fullName;

        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);

                return (
                    parsedUser?.name ||
                    parsedUser?.fullName ||
                    parsedUser?.username ||
                    "Customer"
                );
            } catch {
                return "Customer";
            }
        }

        return "Customer";
    }, [user]);

    const firstName = displayName.split(" ")[0];

    const vehicleNumber =
        user?.vehicleNumber ||
        user?.vehicle?.plateNumber ||
        user?.vehicle?.licensePlate ||
        user?.vehicle?.number ||
        "AA-1234";

    const vehicleModel =
        user?.vehicleModel ||
        user?.vehicle?.model ||
        user?.vehicle?.name ||
        "Your vehicle";

    const availableSpaces = spaces.filter(
        (space) =>
            String(space?.status || "").toUpperCase() === "AVAILABLE"
    ).length;

    const occupiedSpaces = spaces.filter(
        (space) =>
            String(space?.status || "").toUpperCase() === "OCCUPIED"
    ).length;

    const reservedSpaces = spaces.filter(
        (space) =>
            String(space?.status || "").toUpperCase() === "RESERVED"
    ).length;

    const myReservations = reservations.filter((reservation) => {
        const customerId =
            reservation?.customerId ||
            reservation?.customer?.id ||
            reservation?.userId;

        return (
            !user?.id ||
            !customerId ||
            String(customerId) === String(user.id)
        );
    });

    const upcomingReservations = myReservations
        .slice()
        .sort((a, b) => {
            const dateA = new Date(
                a?.startTime || a?.date || a?.reservationDate || 0
            );
            const dateB = new Date(
                b?.startTime || b?.date || b?.reservationDate || 0
            );

            return dateB - dateA;
        })
        .slice(0, 4);

    const handleLogout = async () => {
        try {
            if (typeof logoutUser === "function") {
                await logoutUser();
            }
        } catch (error) {
            console.error("Logout error:", error);
        }

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", {
            replace: true,
        });
    };

    const formatDate = (value) => {
        if (!value) return "No date";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getReservationStatus = (reservation) => {
        return (
            reservation?.status ||
            reservation?.reservationStatus ||
            "PENDING"
        )
            .toString()
            .toUpperCase();
    };

    return (
        <div className="customer-dashboard">
            {/* =========================
          CUSTOMER NAVBAR
      ========================== */}
            <header className="customer-navbar">
                <div className="customer-brand">
                    <div className="customer-brand-icon">
                        <CarFront size={27} strokeWidth={2.3} />
                    </div>

                    <div>
                        <h2>
                            Park<span>Ease</span>
                        </h2>

                        <p>Smart Parking</p>
                    </div>
                </div>

                <div className="customer-navbar-right">
                    <button
                        className="customer-notification"
                        type="button"
                        title="Notifications"
                    >
                        <Bell size={21} />
                        <span className="notification-dot"></span>
                    </button>

                    <div className="customer-profile">
                        <div className="customer-profile-avatar">
                            <User size={21} />
                        </div>

                        <div className="customer-profile-info">
                            <strong>{displayName}</strong>
                            <span>Customer Account</span>
                        </div>
                    </div>

                    <div className="customer-navbar-divider"></div>

                    <button
                        className="customer-logout"
                        type="button"
                        onClick={handleLogout}
                    >
                        <LogOut size={19} />
                        <span>Logout</span>
                    </button>
                </div>
            </header>

            <main className="customer-dashboard-content">
                {/* =========================
            HERO SECTION
        ========================== */}
                <section className="customer-hero">
                    <div className="customer-hero-overlay"></div>

                    <div className="customer-hero-content">
                        <div className="customer-hero-badge">
                            <ShieldCheck size={17} />
                            CUSTOMER PORTAL
                        </div>

                        <h1>
                            Welcome back,{" "}
                            <strong>{firstName}</strong>{" "}
                            <span className="wave">👋</span>
                        </h1>

                        <p>
                            Find your parking space, manage reservations,
                            and enjoy a smarter parking experience.
                        </p>

                        <div className="customer-hero-meta">
                            <span>
                                <CalendarDays size={17} />
                                Easy parking
                            </span>

                            <span className="hero-meta-line"></span>

                            <span>
                                <ShieldCheck size={17} />
                                Safe & Secure
                            </span>
                        </div>
                    </div>

                    <div className="customer-hero-action">
                        <button
                            className="hero-reservation-btn"
                            type="button"
                            onClick={() => navigate("/parking-spaces")}
                        >
                            <CalendarDays size={20} />
                            <span>Make Reservation</span>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </section>

                {/* =========================
            QUICK ACTIONS
        ========================== */}
                <section className="customer-action-grid">
                    <Link
                        to="/parking-spaces"
                        className="customer-action-card primary-action"
                    >
                        <div className="action-icon">
                            <Search size={23} />
                        </div>

                        <div className="action-text">
                            <strong>Find Parking</strong>
                            <span>Find an available space</span>
                        </div>

                        <ChevronRight size={21} className="action-arrow" />
                    </Link>

                    <Link
                        to="/reservations"
                        className="customer-action-card"
                    >
                        <div className="action-icon">
                            <CalendarDays size={23} />
                        </div>

                        <div className="action-text">
                            <strong>My Reservations</strong>
                            <span>Manage your bookings</span>
                        </div>

                        <ChevronRight size={21} className="action-arrow" />
                    </Link>

                    <Link
                        to="/parking-spaces"
                        className="customer-action-card"
                    >
                        <div className="action-icon green-action">
                            <CircleParking size={23} />
                        </div>

                        <div className="action-text">
                            <strong>Parking Spaces</strong>
                            <span>View available parking</span>
                        </div>

                        <ChevronRight size={21} className="action-arrow" />
                    </Link>
                </section>

                {/* =========================
            STATISTICS
        ========================== */}
                <section className="customer-stats-grid">
                    <div className="customer-stat-card">
                        <div className="stat-icon blue-stat">
                            <CarFront size={25} />
                        </div>

                        <div className="stat-info">
                            <span>Total Vehicles</span>
                            <strong>{vehicleNumber ? "1" : "0"}</strong>
                            <small>
                                <CheckCircle2 size={13} />
                                Registered vehicle
                            </small>
                        </div>
                    </div>

                    <div className="customer-stat-card">
                        <div className="stat-icon green-stat">
                            <ParkingSquare size={25} />
                        </div>

                        <div className="stat-info">
                            <span>Available Spaces</span>
                            <strong>{availableSpaces}</strong>
                            <small>
                                <CheckCircle2 size={13} />
                                Ready to book
                            </small>
                        </div>
                    </div>

                    <div className="customer-stat-card">
                        <div className="stat-icon orange-stat">
                            <CarFront size={25} />
                        </div>

                        <div className="stat-info">
                            <span>Occupied Spaces</span>
                            <strong>{occupiedSpaces}</strong>
                            <small>
                                Currently occupied
                            </small>
                        </div>
                    </div>

                    <div className="customer-stat-card">
                        <div className="stat-icon purple-stat">
                            <CalendarDays size={25} />
                        </div>

                        <div className="stat-info">
                            <span>My Reservations</span>
                            <strong>{myReservations.length}</strong>
                            <small>
                                Upcoming bookings
                            </small>
                        </div>
                    </div>
                </section>

                {/* =========================
            VEHICLE + PARKING
        ========================== */}
                <section className="customer-info-grid">
                    {/* Vehicle card */}
                    <div className="customer-info-card vehicle-card">
                        <div className="info-card-heading">
                            <div>
                                <span className="section-label">MY VEHICLE</span>
                                <h2>Your Vehicle</h2>
                            </div>

                            <div className="small-blue-icon">
                                <CarFront size={21} />
                            </div>
                        </div>

                        <div className="vehicle-image-wrapper">
                            <img
                                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85"
                                alt="Modern car parked in a parking area"
                                className="vehicle-real-image"
                            />

                            <div className="vehicle-image-gradient"></div>

                            <div className="vehicle-image-label">
                                <span>REGISTERED VEHICLE</span>
                                <strong>{vehicleNumber}</strong>
                            </div>
                        </div>

                        <div className="vehicle-details">
                            <div>
                                <span>Vehicle</span>
                                <strong>{vehicleModel}</strong>
                            </div>

                            <div>
                                <span>Plate Number</span>
                                <strong>{vehicleNumber}</strong>
                            </div>

                            <div className="vehicle-status">
                                <CheckCircle2 size={17} />
                                Active
                            </div>
                        </div>
                    </div>

                    {/* Parking availability */}
                    <div className="customer-info-card parking-card">
                        <div className="info-card-heading">
                            <div>
                                <span className="section-label">PARKING</span>
                                <h2>Live Availability</h2>
                            </div>

                            <Link
                                to="/parking-spaces"
                                className="view-all-link"
                            >
                                View all
                                <ArrowRight size={16} />
                            </Link>
                        </div>

                        <div className="parking-availability">
                            <div className="parking-availability-item">
                                <div className="availability-icon available-icon">
                                    <CheckCircle2 size={22} />
                                </div>

                                <div>
                                    <strong>{availableSpaces}</strong>
                                    <span>Available</span>
                                </div>
                            </div>

                            <div className="parking-availability-item">
                                <div className="availability-icon occupied-icon">
                                    <CarFront size={22} />
                                </div>

                                <div>
                                    <strong>{occupiedSpaces}</strong>
                                    <span>Occupied</span>
                                </div>
                            </div>

                            <div className="parking-availability-item">
                                <div className="availability-icon reserved-icon">
                                    <CalendarDays size={22} />
                                </div>

                                <div>
                                    <strong>{reservedSpaces}</strong>
                                    <span>Reserved</span>
                                </div>
                            </div>
                        </div>

                        <div className="parking-location">
                            <div className="location-icon">
                                <MapPin size={19} />
                            </div>

                            <div>
                                <strong>ParkEase Parking Area</strong>
                                <span>Safe, convenient and secure parking</span>
                            </div>
                        </div>

                        <button
                            className="find-space-button"
                            type="button"
                            onClick={() => navigate("/parking-spaces")}
                        >
                            <Search size={19} />
                            Find Available Space
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </section>

                {/* =========================
            RESERVATIONS
        ========================== */}
                <section className="customer-reservations-section">
                    <div className="reservations-heading">
                        <div>
                            <span className="section-label">BOOKINGS</span>
                            <h2>My Recent Reservations</h2>
                            <p>Keep track of your parking bookings.</p>
                        </div>

                        <Link
                            to="/reservations"
                            className="reservations-view-all"
                        >
                            View All
                            <ArrowRight size={17} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="customer-empty-state">
                            <div className="loading-spinner"></div>
                            <p>Loading your reservations...</p>
                        </div>
                    ) : upcomingReservations.length === 0 ? (
                        <div className="customer-empty-state">
                            <div className="empty-state-icon">
                                <CalendarDays size={28} />
                            </div>

                            <h3>No reservations yet</h3>

                            <p>
                                You don't have any parking reservations.
                                Find a parking space and make your first booking.
                            </p>

                            <button
                                type="button"
                                className="empty-state-button"
                                onClick={() => navigate("/parking-spaces")}
                            >
                                Find Parking
                                <ArrowRight size={17} />
                            </button>
                        </div>
                    ) : (
                        <div className="customer-reservation-list">
                            {upcomingReservations.map((reservation, index) => {
                                const status = getReservationStatus(reservation);

                                const reservationDate =
                                    reservation?.startTime ||
                                    reservation?.date ||
                                    reservation?.reservationDate;

                                const spaceNumber =
                                    reservation?.parkingSpace?.spaceNumber ||
                                    reservation?.parkingSpace?.number ||
                                    reservation?.spaceNumber ||
                                    reservation?.parkingSpaceId ||
                                    "—";

                                return (
                                    <div
                                        className="customer-reservation-row"
                                        key={reservation?.id || index}
                                    >
                                        <div className="reservation-main-icon">
                                            <CalendarDays size={21} />
                                        </div>

                                        <div className="reservation-info">
                                            <strong>
                                                Parking Space {spaceNumber}
                                            </strong>

                                            <span>
                                                {formatDate(reservationDate)}
                                            </span>
                                        </div>

                                        <div className="reservation-location">
                                            <MapPin size={16} />
                                            ParkEase Parking
                                        </div>

                                        <div
                                            className={`reservation-status status-${status.toLowerCase()}`}
                                        >
                                            {status}
                                        </div>

                                        <ChevronRight
                                            size={19}
                                            className="reservation-chevron"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* =========================
            BOTTOM PROMO
        ========================== */}
                <section className="customer-security-banner">
                    <div className="security-banner-icon">
                        <ShieldCheck size={31} />
                    </div>

                    <div className="security-banner-text">
                        <span>PARKEASE SECURITY</span>
                        <h2>Your Vehicle, Our Priority</h2>
                        <p>
                            Safe • Secure • Convenient parking management
                        </p>
                    </div>

                    <div className="security-banner-car">
                        <CarFront size={95} strokeWidth={1.2} />
                    </div>
                </section>

                <footer className="customer-footer">
                    <span>© 2026 ParkEase</span>
                    <span>Smart Parking Management System</span>
                </footer>
            </main>
        </div>
    );
}

export default CustomerDashboard;