import { NavLink } from "react-router-dom";
import LayoutShell from "./LayoutShell";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { useAuth } from "../../context/AuthContext";
import { can } from "../../auth/permissions";
import { Navigate } from "react-router-dom";

function AdminLayout() {
  const { role } = useAuth();
  const { academicYear, setAcademicYear, availableYears } = useAcademicYear();

  // 🔒 Hard admin gate
  if (!role || !can(role, "VIEW_REPORTS")) {
    return <Navigate to="/dashboard" replace />;
  }

  const sidebar = (
    <>
      <div className="sidebar-header">Smart Kids Academy</div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
        <NavLink to="/students" className="nav-link">Students</NavLink>
        <NavLink to="/teachers" className="nav-link">Teachers</NavLink>
        <NavLink to="/reports" className="nav-link">Reports</NavLink>
        <NavLink to="/admissionForm" className="nav-link">Admission</NavLink>
        <NavLink to="/teachersForm" className="nav-link">Add Teacher</NavLink>
        <NavLink to="/allclasses" className="nav-link">Classes</NavLink>
        <NavLink to="/feestructure" className="nav-link">Fee Structure</NavLink>
        <NavLink to="/expenses" className="nav-link">Expenses</NavLink>
        <NavLink to="/settings" className="nav-link">Settings</NavLink>
      </nav>
    </>
  );

  const topbar = (
    <>
      <div className="topbar-spacer" />
      <div className="topbar-context">
        <label className="topbar-label">Academic Year</label>
        <select
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          className="topbar-select"
        >
          {availableYears.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
    </>
  );

  return <LayoutShell sidebar={sidebar} topbar={topbar} />;
}

export default AdminLayout;
