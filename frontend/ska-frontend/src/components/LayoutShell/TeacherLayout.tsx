import { NavLink, Navigate } from "react-router-dom";
import LayoutShell from "./LayoutShell";
import { useAuth } from "../../context/AuthContext";

function TeacherLayout() {
  const { role } = useAuth();

  if (role !== "TEACHER") {
    return <Navigate to="/dashboard" replace />;
  }

  const sidebar = (
    <>
      <div className="sidebar-header">Smart Kids Academy</div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
        <NavLink to="/students" className="nav-link">Students</NavLink>
        <NavLink to="/allclasses" className="nav-link">
          Class Register
        </NavLink>
      </nav>
    </>
  );

  const topbar = (
    <>
      <div className="topbar-spacer" />
      <div className="topbar-context">
        <span className="topbar-label">
          Teacher Portal
        </span>
      </div>
    </>
  );

  return <LayoutShell sidebar={sidebar} topbar={topbar} />;
}

export default TeacherLayout;
