import { useAcademicYear } from "../../context/AcademicYearContext";
import { useAuth } from "../../context/AuthContext";
import { can } from "../../auth/permissions";
import { Navigate } from "react-router-dom";

function AcademicYearAdmin() {
  const { activeYear, closeYear, isYearClosed } = useAcademicYear();
  const { role } = useAuth();

  // 🔒 Hard RBAC gate
  if (!role || !can(role, "CLOSE_ACADEMIC_YEAR")) {
    return <Navigate to="/students" replace />;
  }

  const handleClose = () => {
    const confirmed = window.confirm(
      `You are about to CLOSE the academic year ${activeYear?.name}.

This action will:
• Lock all records
• Make the year read-only
• Prevent promotions from running again

This CANNOT be undone.

Do you want to continue?`
    );

    if (!confirmed) return;

    closeYear(activeYear?.id || "");
  };

  return (
    <div style={{ padding: "24px" }}>
      <h2>Academic Year Management</h2>

      <p>
        <strong>Current Academic Year:</strong> {activeYear?.name}
      </p>

      <button
        className="danger-btn"
        disabled={isYearClosed(activeYear?.id || "")}
        onClick={handleClose}
      >
        {isYearClosed(activeYear?.id || "")
          ? "Academic Year Closed"
          : "Close Academic Year"}
      </button>

      {isYearClosed(activeYear?.id || "") && (
        <p style={{ color: "red", marginTop: "8px" }}>
          This academic year is closed and is now read-only.
        </p>
      )}
    </div>
  );
}

export default AcademicYearAdmin;
