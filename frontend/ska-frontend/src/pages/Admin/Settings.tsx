import { useNavigate } from "react-router-dom";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { useFeeStructures } from "../../context/FeeStructureContext";
import { useSystemLogs } from "../../context/SystemLogContext";
import AcademicYearTimeline from "./AcademicYearTimeline";
import { apiClient } from "../../services/apiClient";
import { useEffect } from "react";

function SettingsPage() {
  const navigate = useNavigate();

  /* =========================
     Contexts
  ========================= */

  const {
    activeYear,
    closeYear,
    isYearClosed,
    isPromotionLocked,
  } = useAcademicYear();

  const academicYearId = activeYear?.id || "";
  const academicYearName = activeYear?.name || "";

  const { feeStructures } = useFeeStructures();

  const { logs, addLog, loadLogs, loadMoreLogs, hasMore, loading } = useSystemLogs();
  /* =========================
     Derived State
  ========================= */

  const yearClosed = isYearClosed(academicYearId);
  const promotionLocked = isPromotionLocked(academicYearId);

  const activeFeeStructure = feeStructures.find(
    (fs) =>
      fs.academicSessionId === academicYearId && // Updated to academicSessionId matches UUID instead of string name
      fs.status === "ACTIVE"
  );

  /* =========================
     Handlers
  ========================= */
  useEffect(() => {
    loadLogs();
  }, []);

  const handleCloseAcademicYear = async () => {
    try {
      const result = await apiClient.get<{ pendingCount: number }>(
        `/api/academic-years/${academicYearId}/pending-summary`
      );

      const pending = result.pendingCount;

      if (pending > 0) {
        const proceed = window.confirm(
          `${pending} students have outstanding balances.\n\nClose academic year anyway?`
        );

        if (!proceed) return;
      }

      const confirmed = window.confirm(
        `Closing the academic year will:\n
• Run promotions (if not already run)
• Lock the academic year
• Make all data read-only\n
This action CANNOT be undone.\n\nContinue?`
      );

      if (!confirmed) return;

      if (!promotionLocked) {
        await apiClient.post(`/api/academic-years/${academicYearId}/lock-promotion`);
      }

      addLog(
        "ACADEMIC_YEAR_CLOSED",
        academicYearName,
        "Academic year closed from Settings"
      );

      await closeYear(academicYearId);

    } catch (err) {
      console.error("Failed to check pending balances:", err);
      alert("Unable to verify pending balances before closing the academic year.");
    }
  };

  const handleRunBulkPromotion = async () => {
    const confirmed = window.confirm(
      `This will promote ALL eligible students:\n
• Sections will reset
• Class 10 students will become Alumni
• Promotion can run ONLY ONCE\n
This action CANNOT be undone.\n\nContinue?`
    );

    if (!confirmed) return;

    await apiClient.post(`/api/academic-years/${activeYear?.id}/lock-promotion`);

    addLog(
      "BULK_PROMOTION_RUN",
      academicYearName,
      "Bulk promotion executed from Settings"
    );

    navigate("/bulkpromotion");
  };

  const createNextYear = async () => {
    await apiClient.post("/api/academic-years/create-next");
    alert("Next academic year created");
  };

  /* =========================
     Render
  ========================= */

  return (
    <div className="settings-page">
      <h1>Settings</h1>
      <p className="settings-subtitle">
        Administrative controls for system-wide operations.
      </p>

      {/* =========================
          System Status
      ========================= */}
      <section className="settings-section">
        <h2>System Status</h2>

        <div className="settings-grid">
          <div><strong>Academic Year:</strong> {academicYearName}</div>
          <div>
            <strong>Academic Year Status:</strong>{" "}
            {yearClosed ? "CLOSED" : "OPEN"}
          </div>
          <div>
            <strong>Active Fee Structure:</strong>{" "}
            {activeFeeStructure ? "Yes" : "No"}
          </div>
          <div>
            <strong>Promotions Run:</strong>{" "}
            {promotionLocked ? "Yes" : "No"}
          </div>
        </div>
      </section>

      {/* =========================
          Academic Year Management
      ========================= */}
      <section className="settings-section">
        <h2>Academic Year Management</h2>

        <p className="settings-description">
          Closing the academic year finalizes promotions and locks all data.
          This action cannot be undone.
        </p>

        <div className="settings-actions">
          <button
            className="danger-btn"
            disabled={yearClosed}
            onClick={handleCloseAcademicYear}
          >
            Close Academic Year
          </button>

        </div>

        {yearClosed && (
          <p className="settings-description">
            Academic year is closed. No further changes are allowed.
          </p>
        )}


        <button onClick={createNextYear}>
          Create Next Academic Year
        </button>
      </section>

      {/* =========================
          Promotions
      ========================= */}
      <section className="settings-section">
        <h2>Promotions</h2>

        <p className="settings-description">
          Bulk promotion advances all eligible students to the next class.
          Class 10 students are marked as Alumni.
        </p>

        <div className="settings-actions">
          <button
            className="danger-btn"
            disabled={promotionLocked || yearClosed}
            onClick={handleRunBulkPromotion}
          >
            Run Bulk Promotion (Once)
          </button>
        </div>
      </section>

      {/* =========================
          Fee Structure Control
      ========================= */}
      <section className="settings-section">
        <h2>Fee Structure</h2>

        <div className="settings-grid">
          <div>
            <strong>Status:</strong>{" "}
            {activeFeeStructure ? "Active" : "Not Active"}
          </div>
          <div>
            <strong>Academic Year:</strong> {academicYearName}
          </div>
        </div>

        <div className="settings-actions">
          <button
            className="primary-btn"
            disabled={yearClosed}
            onClick={() => navigate("/feestructure")}
          >
            Manage Fee Structures
          </button>
        </div>
      </section>

      {/* =========================
          Reports & Locks
      ========================= */}
      <section className="settings-section">
        <h2>Reports & Data Locks</h2>
        <p>
          <strong>Reports Mode:</strong>{" "}
          {yearClosed ? "Read-only" : "Editable"}
        </p>
      </section>

      <hr style={{ margin: "32px 0", borderColor: "#e5e7eb" }} />

      {/* =========================
          Recent System Activity
      ========================= */}
      <section className="settings-section">
        <h2>Recent System Activity</h2>

        {logs.length === 0 && (
          <p className="settings-description">
            No system-level actions recorded yet.
          </p>
        )}

        {logs.map(log => (
          <div key={log.id} style={{ fontSize: "0.9rem", marginBottom: "6px" }}>
            <strong>
              {new Date(log.createdAt).toLocaleString()}
            </strong>{" "}
            — {(log.event ?? "").replaceAll("_", " ")} ({log.entityType})
          </div>
        ))}
        {hasMore && (
          <button
            className="secondary-btn"
            style={{ marginTop: "12px", width: "100%" }}
            onClick={() => loadMoreLogs()}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load Older Logs"}
          </button>
        )}
      </section>

      {/* =========================
          System Information
      ========================= */}
      <section className="settings-section">
        <h2>System Information</h2>

        <div className="settings-grid">
          <div><strong>Environment:</strong> Cloud (PostgreSQL)</div>
          <div><strong>Storage:</strong> Remote Backend</div>
        </div>
      </section>

      <AcademicYearTimeline />
    </div>
  );
}

export default SettingsPage;
