import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


function Login() {
  const {
    isAuthenticated,
    loginAsAdmin,
    enterAsTeacher,
  } = useAuth();

  const [mode, setMode] =
    useState<"NONE" | "ADMIN">("NONE");
  const [adminCode, setAdminCode] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="login-page">
      <h1>Smart Kids Academy</h1>

      {mode === "NONE" && (
        <div className="login-options">
          <button onClick={enterAsTeacher}>
            Enter as Teacher
          </button>

          <button onClick={() => setMode("ADMIN")}>
            Admin Login
          </button>
        </div>
      )}

      {mode === "ADMIN" && (
        <div className="login-box">
          <h3>Admin Login</h3>

          <input
            type="password"
            placeholder="Enter admin code"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
          />

          <button
            onClick={() => {
              const ok = loginAsAdmin(adminCode);
              if (!ok) alert("Invalid admin code");
            }}
          >
            Login
          </button>

          <button
            className="link-btn"
            onClick={() => setMode("NONE")}
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}

export default Login;
