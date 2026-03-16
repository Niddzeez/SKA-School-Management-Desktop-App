import React from "react";
import DashboardKPIs from "./DashboardKPI";
import { useAuth } from "../../context/AuthContext";
import "./dashboard.css";
import { can } from "../../auth/permissions";
import { Navigate } from "react-router-dom";

function AdminDashboard(): React.ReactElement {
  const { role } = useAuth();

  if (!role || !can(role, "VIEW_REPORTS")) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="dashboard-page">

      {/* ── Header ── */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back — here's your financial overview</p>
        </div>
      </div>

      {/* ── KPI Section ── */}
      <DashboardKPIs />

    </div>
  );
}

export default AdminDashboard;