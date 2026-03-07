import DashboardKPIs from "./DashboardKPI";
import { useAuth } from "../../context/AuthContext";
import "./dashboard.css";
import { can } from "../../auth/permissions"
import { Navigate } from "react-router-dom";

function AdminDashboard() {
    const { role } = useAuth();

    if (!role || !can(role, "VIEW_REPORTS")) {
        return <Navigate to="/dashboard" replace />
    }

    return (
        <div className="dashboard-page">
            {/* =========================
          Header
      ========================= */}
            <div className="dashboard-header">
                <h1>Dashboard</h1>


            </div>

            {/* =========================
          KPI Section
      ========================= */}
            <DashboardKPIs />

            {/* =========================
          Future Sections (placeholder)
          Intentionally empty for now
      ========================= */}
            {/*
        <div className="dashboard-section">
          Charts / Pending Fees / Trends
        </div>
      */}

        </div>
    );
}

export default AdminDashboard;
