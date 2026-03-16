import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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

  useEffect(() => {
    clearError();
  }, [clearError]);

  if (loading) {
    return <div className="login-page">Loading session...</div>;
  }

  if (isAuthenticated) {
    if (role === "ADMIN") {
      return <Navigate to="/dashboard/admin" replace />;
    }
    if (role === "TEACHER") {
      return <Navigate to="/dashboard/teacher" replace />;
    }
    // Fallback if role is not mapped
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
    <div className="login-page">
      <h1>Smart Kids Academy</h1>

      <div className="login-box">
        <h3>System Login</h3>

        {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
            style={{ display: 'block', width: '100%', marginBottom: '10px' }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting}
            style={{ display: 'block', width: '100%', marginBottom: '10px' }}
          />

          <button
            type="submit"
            disabled={isSubmitting || !email || !password}
            style={{ width: '100%' }}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
