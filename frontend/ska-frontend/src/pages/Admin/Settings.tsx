import { useNavigate } from "react-router-dom";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { useFeeStructures } from "../../context/FeeStructureContext";
import { exportBackup, importBackup } from "../../utils/Backup";
import { useSystemLogs } from "../../context/SystemLogContext";
import AcademicYearTimeline from "./AcademicYearTimeline";

function SettingsPage() {
  const navigate = useNavigate();

  /* =========================
     Contexts
  ========================= */

  const {
    academicYear,
    closeYear,
    isYearClosed,
    isPromotionLocked,
    lockPromotion,
    getPromotionSummary,
    requestAutoPromotion,
  } = useAcademicYear();

  const { feeStructures } = useFeeStructures();

  const { logs, addLog } = useSystemLogs();
  console.log("SYSTEM LOGS:", logs);
  /* =========================
     Derived State
  ========================= */

  const yearClosed = isYearClosed(academicYear);
  const promotionLocked = isPromotionLocked(academicYear);
  const promotionSummary = getPromotionSummary(academicYear);

  const activeFeeStructure = feeStructures.find(
    (fs) =>
      fs.academicYear === academicYear &&
      fs.status === "ACTIVE"
  );

  /* =========================
     Handlers
  ========================= */

  const handleCloseAcademicYear = () => {
    const confirmed = window.confirm(
      `Closing the academic year will:\n
• Run promotions (if not already run)
• Lock the academic year
• Make all data read-only\n
This action CANNOT be undone.\n\nContinue?`
    );

    if (!confirmed) return;

    if (!promotionLocked) {
      requestAutoPromotion(academicYear);
      lockPromotion(academicYear);
    }

    addLog(
      "ACADEMIC_YEAR_CLOSED",
      academicYear,
      "Academic year closed from Settings"
    );

    closeYear(academicYear);
  };

  const handleRunBulkPromotion = () => {
    const confirmed = window.confirm(
      `This will promote ALL eligible students:\n
• Sections will reset
• Class 10 students will become Alumni
• Promotion can run ONLY ONCE\n
This action CANNOT be undone.\n\nContinue?`
    );

    if (!confirmed) return;

    requestAutoPromotion(academicYear);
    lockPromotion(academicYear);

    addLog(
      "BULK_PROMOTION_RUN",
      academicYear,
      "Bulk promotion executed from Settings"
    );

    navigate("/bulkpromotion");
  };

  const handleImportBackup = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmed = window.confirm(
      "Importing a backup will OVERWRITE all existing data.\n\nContinue?"
    );

    if (!confirmed) return;

    // 🔒 Log BEFORE reload
    addLog(
      "BACKUP_RESTORED",
      academicYear,
      "System restored from backup"
    );

    try {
      await importBackup(file);
      alert("Backup restored successfully. Reloading…");
      window.location.reload();
    } catch {
      alert("Invalid backup file.");
    }
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
          <div><strong>Academic Year:</strong> {academicYear}</div>
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
          <div>
            <strong>Promotion Summary:</strong>{" "}
            {promotionSummary ? "Available" : "Not Generated"}
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

          {promotionSummary && (
            <button
              className="secondary-btn"
              onClick={() => navigate("/reports/promotion-summary")}
            >
              View Promotion Summary
            </button>
          )}
        </div>

        {yearClosed && (
          <p className="settings-description">
            Academic year is closed. No further changes are allowed.
          </p>
        )}
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
            <strong>Academic Year:</strong> {academicYear}
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
          Backup & Restore
      ========================= */}
      <section className="settings-section settings-critical">
        <h2>Backup & Restore</h2>

        <p className="settings-description">
          It is recommended to take a full backup weekly.
        </p>

        <div className="settings-actions">
          <button
            className="primary-btn"
            onClick={exportBackup}
          >
            Download Full Backup
          </button>

          <label className="danger-btn file-upload">
            Restore From Backup
            <input
              type="file"
              accept="application/json"
              hidden
              onChange={handleImportBackup}
            />
          </label>
        </div>
      </section>

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

        {logs.slice(-5).reverse().map(log => (
          <div key={log.id} style={{ fontSize: "0.9rem", marginBottom: "6px" }}>
            <strong>
              {new Date(log.timestamp).toLocaleString()}
            </strong>{" "}
            — {log.event.replaceAll("_", " ")} ({log.academicYear})
          </div>
        ))}
      </section>

      {/* =========================
          System Information
      ========================= */}
      <section className="settings-section">
        <h2>System Information</h2>

        <div className="settings-grid">
          <div><strong>Environment:</strong> Local</div>
          <div><strong>Storage:</strong> Persistent Browser Storage</div>
        </div>
      </section>

      <AcademicYearTimeline />
    </div>
  );
}

export default SettingsPage;
