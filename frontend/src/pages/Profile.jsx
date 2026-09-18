import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    UserCircle,
    Mail,
    Phone,
    MapPin,
    ShieldCheck,
    Save,
    ArrowLeft,
    Camera,
    CheckCircle2,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import "./ProfileSettings.css";

function Profile() {
    const navigate = useNavigate();

    // Get stored user
    const getStoredUser = () => {
        try {
            return JSON.parse(
                localStorage.getItem("user") || "{}"
            );
        } catch {
            return {};
        }
    };

    const storedUser = getStoredUser();

    const [name, setName] = useState(
        storedUser.name || "System Administrator"
    );

    const [email, setEmail] = useState(
        storedUser.email || "admin@parking.com"
    );

    const [phone, setPhone] = useState(
        storedUser.phone || ""
    );

    const [location, setLocation] = useState(
        storedUser.location || "Addis Ababa, Ethiopia"
    );

    const [saved, setSaved] = useState(false);

    const role = storedUser.role || "ADMIN";

    // Save profile
    const handleSave = (e) => {
        e.preventDefault();

        const updatedUser = {
            ...storedUser,
            name,
            email,
            phone,
            location,
            role,
        };

        localStorage.setItem(
            "user",
            JSON.stringify(updatedUser)
        );

        setSaved(true);

        setTimeout(() => {
            setSaved(false);
        }, 3000);
    };

    // Keep page at top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="admin-layout">

            {/* ================= SIDEBAR ================= */}
            <Sidebar />

            {/* ================= MAIN AREA ================= */}
            <div className="admin-main">

                {/* Navbar */}
                <Navbar title="My Profile" />

                {/* Page Content */}
                <main className="profile-settings-content">

                    {/* ================= PAGE HEADER ================= */}
                    <div className="ps-page-header">

                        <div>
                            <button
                                className="ps-back-button"
                                onClick={() =>
                                    navigate("/dashboard")
                                }
                            >
                                <ArrowLeft size={18} />
                                Back to Dashboard
                            </button>

                            <div className="ps-title-area">

                                <div className="ps-title-icon profile-title-icon">
                                    <UserCircle size={26} />
                                </div>

                                <div>
                                    <h1>My Profile</h1>

                                    <p>
                                        Manage your ParkEase account
                                        information and profile
                                    </p>
                                </div>

                            </div>
                        </div>

                    </div>


                    {/* ================= PROFILE GRID ================= */}
                    <div className="profile-grid">

                        {/* ================= LEFT PROFILE CARD ================= */}
                        <section className="profile-card profile-overview">

                            <div className="profile-cover"></div>

                            <div className="profile-avatar-wrapper">

                                <div className="profile-avatar">

                                    <UserCircle
                                        size={72}
                                        strokeWidth={1.5}
                                    />

                                </div>

                                <button
                                    className="avatar-camera"
                                    title="Change profile picture"
                                    type="button"
                                >
                                    <Camera size={16} />
                                </button>

                            </div>

                            <div className="profile-main-info">

                                <h2>{name}</h2>

                                <span className="admin-badge">
                                    <ShieldCheck size={15} />
                                    {role}
                                </span>

                                <p className="profile-description">
                                    ParkEase system administrator
                                </p>

                            </div>


                            {/* Account Details */}
                            <div className="profile-details">

                                <div className="profile-detail">

                                    <div className="detail-icon">
                                        <Mail size={18} />
                                    </div>

                                    <div>
                                        <span>Email Address</span>
                                        <strong>
                                            {email || "Not provided"}
                                        </strong>
                                    </div>

                                </div>


                                <div className="profile-detail">

                                    <div className="detail-icon">
                                        <Phone size={18} />
                                    </div>

                                    <div>
                                        <span>Phone Number</span>
                                        <strong>
                                            {phone || "Not provided"}
                                        </strong>
                                    </div>

                                </div>


                                <div className="profile-detail">

                                    <div className="detail-icon">
                                        <MapPin size={18} />
                                    </div>

                                    <div>
                                        <span>Location</span>
                                        <strong>
                                            {location}
                                        </strong>
                                    </div>

                                </div>


                                <div className="profile-detail">

                                    <div className="detail-icon">
                                        <ShieldCheck size={18} />
                                    </div>

                                    <div>
                                        <span>Account Type</span>
                                        <strong>
                                            Administrator
                                        </strong>
                                    </div>

                                </div>

                            </div>

                        </section>


                        {/* ================= RIGHT EDIT CARD ================= */}
                        <section className="profile-card profile-edit-card">

                            <div className="ps-card-header">

                                <div>
                                    <h2>Personal Information</h2>

                                    <p>
                                        Update your personal account
                                        information below.
                                    </p>
                                </div>

                            </div>


                            {/* Success */}
                            {saved && (
                                <div className="ps-success-message">
                                    <CheckCircle2 size={19} />
                                    <span>
                                        Profile updated successfully.
                                    </span>
                                </div>
                            )}


                            <form onSubmit={handleSave}>

                                <div className="profile-form-grid">

                                    {/* Full Name */}
                                    <div className="ps-form-group">

                                        <label>
                                            Full Name
                                        </label>

                                        <div className="ps-input-wrapper">

                                            <UserCircle size={19} />

                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) =>
                                                    setName(e.target.value)
                                                }
                                                placeholder="Enter full name"
                                            />

                                        </div>

                                    </div>


                                    {/* Email */}
                                    <div className="ps-form-group">

                                        <label>
                                            Email Address
                                        </label>

                                        <div className="ps-input-wrapper">

                                            <Mail size={19} />

                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) =>
                                                    setEmail(e.target.value)
                                                }
                                                placeholder="Enter email"
                                            />

                                        </div>

                                    </div>


                                    {/* Phone */}
                                    <div className="ps-form-group">

                                        <label>
                                            Phone Number
                                        </label>

                                        <div className="ps-input-wrapper">

                                            <Phone size={19} />

                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) =>
                                                    setPhone(e.target.value)
                                                }
                                                placeholder="Enter phone number"
                                            />

                                        </div>

                                    </div>


                                    {/* Location */}
                                    <div className="ps-form-group">

                                        <label>
                                            Location
                                        </label>

                                        <div className="ps-input-wrapper">

                                            <MapPin size={19} />

                                            <input
                                                type="text"
                                                value={location}
                                                onChange={(e) =>
                                                    setLocation(e.target.value)
                                                }
                                                placeholder="Enter location"
                                            />

                                        </div>

                                    </div>

                                </div>


                                {/* Role */}
                                <div className="profile-role-box">

                                    <div className="role-left">

                                        <div className="role-icon">
                                            <ShieldCheck size={21} />
                                        </div>

                                        <div>
                                            <strong>
                                                Account Role
                                            </strong>

                                            <span>
                                                Your current ParkEase
                                                access level
                                            </span>
                                        </div>

                                    </div>

                                    <div className="role-value">
                                        {role}
                                    </div>

                                </div>


                                {/* Buttons */}
                                <div className="ps-form-actions">

                                    <button
                                        type="button"
                                        className="ps-secondary-button"
                                        onClick={() =>
                                            navigate("/dashboard")
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="ps-primary-button"
                                    >
                                        <Save size={18} />
                                        Save Changes
                                    </button>

                                </div>

                            </form>

                        </section>

                    </div>

                </main>

            </div>

        </div>
    );
}

export default Profile;