import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.svg";
import "./Login.css";

function Login() {
  const {
    isAuthenticated,
    role,
    login,
    loading,
    error,
    clearError,
  } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    clearError();
  }, [clearError]);

  if (loading) {
    return (
      <div className="login-root">
        <div className="login-loading">Loading session...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    if (role === "ADMIN") return <Navigate to="/dashboard/admin" replace />;
    if (role === "TEACHER") return <Navigate to="/dashboard/teacher" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    await login(email, password);
    setIsSubmitting(false);
  };

  return (
    <div className="login-root">

      {/* Decorative rings */}
      <div className="login-ring login-ring-1" />
      <div className="login-ring login-ring-2" />
      <div className="login-ring login-ring-3" />

      <div className="login-card">

        {/* Logo + school name */}
        <div className="login-logo-wrap">
          <img src={logo} alt="School Logo" className="login-logo-svg" />
        </div>

        <h1 className="login-school">Smart Kids Academy</h1>
        <p className="login-sub">Management System · Sign in to continue</p>

        {/* Error */}
        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="login-form" onSubmit={handleLogin}>

          <div className="login-field">
            <label className="login-label">Email address</label>
            <input
              className="login-input"
              type="email"
              placeholder="admin@ska.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              autoComplete="email"
            />
          </div>

          <div className="login-field">
            <label className="login-label">Password</label>
            <div className="login-pw-wrap">
              <input
                className="login-input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-pw-toggle"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            className="login-btn"
            type="submit"
            disabled={isSubmitting || !email || !password}
          >
            {isSubmitting ? (
              <span className="login-btn-spinner" />
            ) : (
              "Sign in"
            )}
          </button>

        </form>

        <p className="login-footer">
          Smart Kids Academy · Sonai
        </p>

      </div>
    </div>
  );
}

export default Login;