import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Car,
  ShieldCheck,
} from "lucide-react";

import { loginUser } from "../Services/api";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    if (
      !formData.email.trim() ||
      !formData.password
    ) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser({
        email: formData.email
          .trim()
          .toLowerCase(),
        password: formData.password,
      });

      if (!response.success) {
        throw new Error(
          response.message ||
          "Unable to sign in."
        );
      }

      // ==============================
      // STORE AUTHENTICATION
      // ==============================

      localStorage.setItem(
        "token",
        response.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.user)
      );

      // ==============================
      // ROLE-BASED REDIRECT
      // ==============================

      const role = response.user?.role;

      if (role === "CUSTOMER") {
        navigate("/customer-dashboard", {
          replace: true,
        });
      } else if (
        role === "ADMIN" ||
        role === "STAFF"
      ) {
        navigate("/dashboard", {
          replace: true,
        });
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setError(
          "Your account has an invalid role."
        );
      }
    } catch (err) {
      setError(
        err.message ||
        "Unable to sign in. Please try again."
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

      <div className="auth-container">
        {/* BRAND */}

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

        {/* LOGIN CARD */}

        <div className="auth-card login-card">
          <div className="auth-header">
            <div className="auth-header-icon">
              <LogIn size={24} />
            </div>

            <h2>Welcome Back</h2>

            <p>
              Sign in to manage your parking
              reservations.
            </p>
          </div>

          {/* ERROR */}

          {error && (
            <div className="auth-alert auth-alert-error">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
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

            {/* PASSWORD */}

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="password">
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={() =>
                    setError(
                      "Password reset is not configured yet."
                    )
                  }
                >
                  Forgot password?
                </button>
              </div>

              <div className="auth-input-wrapper">
                <Lock size={18} />

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
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

            {/* SECURITY */}

            <div className="auth-security-note">
              <ShieldCheck size={18} />

              <span>
                Secure authentication powered by
                ParkEase.
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
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* REGISTER */}

          <div className="auth-footer">
            <span>
              Don't have a ParkEase account?
            </span>

            <Link to="/register">
              Create Account
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

export default Login;