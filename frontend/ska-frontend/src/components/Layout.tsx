import { NavLink, Outlet } from "react-router-dom";
import "../styles/layout.css";

function Layout() {
  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          Smart Kids Academy
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/students" className="nav-link">
            Students
          </NavLink>
          <NavLink to="/teachers" className="nav-link">
            Teachers
          </NavLink>
          <NavLink to="/reports" className="nav-link">
            Reports
          </NavLink>
          <NavLink to="/admissionForm" className="nav-link">
            Admission Form
          </NavLink>
          <NavLink to="/teachersForm" className="nav-link">
            Teachers Form
          </NavLink>
          <NavLink to="/allclasses" className="nav-link">
            All Classes
          </NavLink>
          <NavLink to="/feestructure" className="nav-link">
            Fee Structure
          </NavLink>
        </nav>
      </aside>

      {/* Main Area */}
      <div className="main-area">
        <header className="topbar">
          School Management System
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
