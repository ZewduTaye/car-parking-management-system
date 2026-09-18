import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    User,
    Mail,
    Phone,
    Car,
    Lock,
    Eye,
    EyeOff,
    UserPlus,
    ShieldCheck,
} from "lucide-react";

import { registerCustomer } from "../Services/api";

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        vehiclePlate: "",
        carModel: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const {
            fullName,
            email,
            phone,
            vehiclePlate,
            carModel,
            password,
            confirmPassword,
        } = formData;

        // ==============================
        // FRONTEND VALIDATION
        // ==============================

        if (
            !fullName.trim() ||
            !email.trim() ||
            !phone.trim() ||
            !vehiclePlate.trim() ||
            !password ||
            !confirmPassword
        ) {
            setError("Please fill in all required fields.");
            return;
        }

        if (password.length < 8) {
            setError(
                "Password must contain at least 8 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            // ==============================
            // SEND TO BACKEND
            // ==============================

            const response = await registerCustomer({
                fullName: fullName.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.trim(),
                vehiclePlate: vehiclePlate
                    .trim()
                    .toUpperCase(),
                carModel: carModel.trim(),
                password,
                confirmPassword,
            });

            if (!response.success) {
                throw new Error(
                    response.message || "Registration failed."
                );
            }

            // ==============================
            // SAVE AUTHENTICATION
            // ==============================

            localStorage.setItem(
                "token",
                response.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(response.user)
            );

            setSuccess(
                "Account created successfully. Redirecting..."
            );

            // ==============================
            // CUSTOMER DASHBOARD
            // ==============================

            setTimeout(() => {
                navigate("/customer-dashboard", {
                    replace: true,
                });
            }, 700);
        } catch (err) {
            setError(
                err.message ||
                "Unable to create your account. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Background */}
            <div className="auth-background">
                <div className="auth-shape auth-shape-one" />
                <div className="auth-shape auth-shape-two" />
            </div>

            <div className="auth-container register-container">
                {/* =========================
            BRAND
        ========================== */}

                <div className="auth-brand">
                    <div className="auth-brand-icon">
                        <Car size={28} />
                    </div>

                    <div>
                        <h1>
                            Park<span>Ease</span>
                        </h1>

                        <p>Smart Parking Management</p>
                    </div>
                </div>

                {/* =========================
            REGISTER CARD
        ========================== */}

                <div className="auth-card">
                    <div className="auth-header">
                        <div className="auth-header-icon">
                            <UserPlus size={24} />
                        </div>

                        <h2>Create Customer Account</h2>

                        <p>
                            Register with ParkEase to reserve your
                            parking space.
                        </p>
                    </div>

                    {/* =========================
              ERROR
          ========================== */}

                    {error && (
                        <div className="auth-alert auth-alert-error">
                            <span>⚠️</span>
                            <p>{error}</p>
                        </div>
                    )}

                    {/* =========================
              SUCCESS
          ========================== */}

                    {success && (
                        <div className="auth-alert auth-alert-success">
                            <span>✓</span>
                            <p>{success}</p>
                        </div>
                    )}

                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >
                        {/* FULL NAME */}

                        <div className="auth-field">
                            <label htmlFor="fullName">
                                Full Name
                            </label>

                            <div className="auth-input-wrapper">
                                <User size={18} />

                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    autoComplete="name"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        {/* EMAIL */}

                        <div className="auth-field">
                            <label htmlFor="email">
                                Email Address
                            </label>

                            <div className="auth-input-wrapper">
                                <Mail size={18} />

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        {/* PHONE */}

                        <div className="auth-field">
                            <label htmlFor="phone">
                                Phone Number
                            </label>

                            <div className="auth-input-wrapper">
                                <Phone size={18} />

                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="09XXXXXXXX"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    autoComplete="tel"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        {/* VEHICLE */}

                        <div className="auth-form-row">
                            <div className="auth-field">
                                <label htmlFor="vehiclePlate">
                                    Vehicle Plate
                                </label>

                                <div className="auth-input-wrapper">
                                    <Car size={18} />

                                    <input
                                        id="vehiclePlate"
                                        name="vehiclePlate"
                                        type="text"
                                        placeholder="AA-12345"
                                        value={formData.vehiclePlate}
                                        onChange={handleChange}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="auth-field">
                                <label htmlFor="carModel">
                                    Car Model
                                </label>

                                <div className="auth-input-wrapper">
                                    <Car size={18} />

                                    <input
                                        id="carModel"
                                        name="carModel"
                                        type="text"
                                        placeholder="Toyota Corolla"
                                        value={formData.carModel}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* PASSWORD */}

                        <div className="auth-field">
                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="auth-input-wrapper">
                                <Lock size={18} />

                                <input
                                    id="password"
                                    name="password"
                                    type={
                                        showPassword ? "text" : "password"
                                    }
                                    placeholder="At least 8 characters"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    disabled={loading}
                                    required
                                />

                                <button
                                    type="button"
                                    className="auth-password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            (current) => !current
                                        )
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* CONFIRM PASSWORD */}

                        <div className="auth-field">
                            <label htmlFor="confirmPassword">
                                Confirm Password
                            </label>

                            <div className="auth-input-wrapper">
                                <Lock size={18} />

                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Repeat your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    disabled={loading}
                                    required
                                />

                                <button
                                    type="button"
                                    className="auth-password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            (current) => !current
                                        )
                                    }
                                    aria-label={
                                        showConfirmPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* SECURITY */}

                        <div className="auth-security-note">
                            <ShieldCheck size={18} />

                            <span>
                                Your password is securely encrypted.
                            </span>
                        </div>

                        {/* SUBMIT */}

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="auth-spinner" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    <UserPlus size={18} />
                                    Create Account
                                </>
                            )}
                        </button>
                    </form>

                    {/* LOGIN */}

                    <div className="auth-footer">
                        <span>
                            Already have an account?
                        </span>

                        <Link to="/login">
                            Sign In
                        </Link>
                    </div>
                </div>

                {/* FOOTER */}

                <div className="auth-bottom-text">
                    © {new Date().getFullYear()} ParkEase.
                    Smart Parking Management System.
                </div>
            </div>
        </div>
    );
};

export default Register;