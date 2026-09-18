import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Settings as SettingsIcon,
    Bell,
    Moon,
    Sun,
    Languages,
    ShieldCheck,
    Save,
    ArrowLeft,
    CheckCircle2,
    Monitor,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import "./ProfileSettings.css";

function Settings() {
    const navigate = useNavigate();

    // =========================
    // SETTINGS STATE
    // =========================

    const [notifications, setNotifications] =
        useState(
            localStorage.getItem("notifications") !==
            "false"
        );

    const [darkMode, setDarkMode] =
        useState(
            localStorage.getItem("darkMode") ===
            "true"
        );

    const [language, setLanguage] =
        useState(
            localStorage.getItem("language") ||
            "English"
        );

    const [saved, setSaved] = useState(false);


    // =========================
    // DARK MODE
    // =========================

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add(
                "dark-mode"
            );
        } else {
            document.body.classList.remove(
                "dark-mode"
            );
        }
    }, [darkMode]);


    // =========================
    // SAVE SETTINGS
    // =========================

    const handleSave = () => {

        localStorage.setItem(
            "notifications",
            String(notifications)
        );

        localStorage.setItem(
            "darkMode",
            String(darkMode)
        );

        localStorage.setItem(
            "language",
            language
        );

        setSaved(true);

        setTimeout(() => {
            setSaved(false);
        }, 3000);
    };


    return (
        <div className="admin-layout">

            {/* ================= SIDEBAR ================= */}
            <Sidebar />

            {/* ================= MAIN ================= */}
            <div className="admin-main">

                {/* Navbar */}
                <Navbar title="Settings" />

                {/* Content */}
                <main className="profile-settings-content">

                    {/* ================= HEADER ================= */}
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

                                <div className="ps-title-icon settings-title-icon">
                                    <SettingsIcon size={26} />
                                </div>

                                <div>

                                    <h1>Settings</h1>

                                    <p>
                                        Customize your ParkEase
                                        dashboard experience
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* ================= SETTINGS GRID ================= */}
                    <div className="settings-page-grid">

                        {/* ================= GENERAL ================= */}
                        <section className="settings-card">

                            <div className="ps-card-header">

                                <div className="settings-header-icon">
                                    <SettingsIcon size={21} />
                                </div>

                                <div>
                                    <h2>General Settings</h2>

                                    <p>
                                        Manage your general
                                        application preferences.
                                    </p>
                                </div>

                            </div>


                            {/* Notifications */}
                            <div className="setting-item">

                                <div className="setting-item-left">

                                    <div className="setting-item-icon">
                                        <Bell size={21} />
                                    </div>

                                    <div>

                                        <strong>
                                            Notifications
                                        </strong>

                                        <span>
                                            Receive notifications about
                                            parking reservations and
                                            system updates.
                                        </span>

                                    </div>

                                </div>


                                <label className="toggle-switch">

                                    <input
                                        type="checkbox"
                                        checked={notifications}
                                        onChange={(e) =>
                                            setNotifications(
                                                e.target.checked
                                            )
                                        }
                                    />

                                    <span className="toggle-slider"></span>

                                </label>

                            </div>


                            {/* Dark Mode */}
                            <div className="setting-item">

                                <div className="setting-item-left">

                                    <div className="setting-item-icon">

                                        {darkMode ? (
                                            <Moon size={21} />
                                        ) : (
                                            <Sun size={21} />
                                        )}

                                    </div>

                                    <div>

                                        <strong>
                                            Dark Mode
                                        </strong>

                                        <span>
                                            Change the appearance of
                                            the dashboard.
                                        </span>

                                    </div>

                                </div>


                                <label className="toggle-switch">

                                    <input
                                        type="checkbox"
                                        checked={darkMode}
                                        onChange={(e) =>
                                            setDarkMode(
                                                e.target.checked
                                            )
                                        }
                                    />

                                    <span className="toggle-slider"></span>

                                </label>

                            </div>


                            {/* Language */}
                            <div className="setting-item">

                                <div className="setting-item-left">

                                    <div className="setting-item-icon">
                                        <Languages size={21} />
                                    </div>

                                    <div>

                                        <strong>
                                            Language
                                        </strong>

                                        <span>
                                            Choose your preferred
                                            application language.
                                        </span>

                                    </div>

                                </div>


                                <select
                                    className="language-select"
                                    value={language}
                                    onChange={(e) =>
                                        setLanguage(
                                            e.target.value
                                        )
                                    }
                                >
                                    <option>
                                        English
                                    </option>

                                    <option>
                                        Amharic
                                    </option>

                                </select>

                            </div>

                        </section>


                        {/* ================= SECURITY ================= */}
                        <section className="settings-card">

                            <div className="ps-card-header">

                                <div className="settings-header-icon security-icon">
                                    <ShieldCheck size={21} />
                                </div>

                                <div>

                                    <h2>Security</h2>

                                    <p>
                                        Manage your account security
                                        preferences.
                                    </p>

                                </div>

                            </div>


                            <div className="security-panel">

                                <div className="security-panel-icon">
                                    <ShieldCheck size={27} />
                                </div>

                                <div>

                                    <h3>
                                        Account Protection
                                    </h3>

                                    <p>
                                        Your ParkEase account is
                                        protected by authentication
                                        and role-based access control.
                                    </p>

                                </div>

                                <span className="security-status">
                                    Active
                                </span>

                            </div>


                            <div className="security-info-row">

                                <Monitor size={19} />

                                <span>
                                    Only authorized users can
                                    access administrative features.
                                </span>

                            </div>

                        </section>


                        {/* ================= SAVE ================= */}
                        <div className="settings-save-area">

                            {saved && (
                                <div className="settings-saved-message">

                                    <CheckCircle2 size={18} />

                                    Settings saved successfully.

                                </div>
                            )}


                            <button
                                className="ps-primary-button"
                                onClick={handleSave}
                            >
                                <Save size={18} />
                                Save Settings
                            </button>

                        </div>

                    </div>

                </main>

            </div>

        </div>
    );
}

export default Settings;