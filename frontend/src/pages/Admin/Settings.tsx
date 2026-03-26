import { useNavigate } from "react-router-dom";
import { useAcademicYear } from "../../context/AcademicYearContext";
import { useFeeStructures } from "../../context/FeeStructureContext";
import { useSystemLogs } from "../../context/SystemLogContext";
import AcademicYearTimeline from "./AcademicYearTimeline";
import { apiClient } from "../../services/apiClient";
import { useEffect } from "react";
import "./SettingsPage.css";

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
      fs.academicSessionId === academicYearId &&
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

      const pending = result?.pendingCount ?? 0;

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
        await apiClient.post(`/api/academic-years/${academicYearId}/run-promotion`);
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

  type PromotionReadiness = {
    ready: boolean;
    nextAcademicSessionId?: string;
    reason?: string;
  };

  const handleRunBulkPromotion = async () => {
    const confirmed = window.confirm(
      `This will promote ALL eligible students:\n
• Sections will be preserved
• Class 10 students will become Alumni
• Promotion can run ONLY ONCE\n
This action CANNOT be undone.\n\nContinue?`
    );
    if (!confirmed) return;

    try {
      // 🔍 Step 1 — Check readiness
      const readiness = await apiClient.get<PromotionReadiness>(
        `/api/academic-years/${activeYear?.id}/promotion-readiness`
      );

      if (!readiness?.ready) {
        alert(
          "Cannot run promotion.\n\nPlease ensure:\n• Next academic year is created\n• Fee structures are set and ACTIVE"
        );
        return;
      }

      // 🚀 Step 2 — Run promotion
      await apiClient.post(
        `/api/academic-years/${activeYear?.id}/run-promotion`
      );

      // 📝 Step 3 — Log action
      addLog(
        "BULK_PROMOTION_RUN",
        academicYearName,
        "Bulk promotion executed from Settings"
      );

      // ✅ Step 4 — Feedback
      alert("Promotion completed successfully");

    } catch (err: any) {
      alert(err.message || "Promotion failed");
    }
  };


  const createNextYear = async () => {
    await apiClient.post("/api/academic-year-system/create-next");
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
          Overview row
      ========================= */}
      <p className="settings-section-label">Overview</p>

      <div className="settings-grid-cards">

        {/* System Status card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon icon-blue">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5" height="5" rx="1" fill="#3b82f6" />
                <rect x="9" y="2" width="5" height="5" rx="1" fill="#3b82f6" />
                <rect x="2" y="9" width="5" height="5" rx="1" fill="#3b82f6" />
                <rect x="9" y="9" width="5" height="5" rx="1" fill="#93c5fd" />
              </svg>
            </div>
            <span className="settings-card-title">System status</span>
          </div>

          <div className="settings-stat-row">
            <div className="settings-stat settings-stat--blue">
              <div className="settings-stat-label">Academic year</div>
              <div className="settings-stat-value">{academicYearName || "—"}</div>
            </div>

            <div className={`settings-stat ${yearClosed ? "settings-stat--red" : "settings-stat--green"}`}>
              <div className="settings-stat-label">Year status</div>
              <div className="settings-stat-value">
                <span className={`badge ${yearClosed ? "badge--closed" : "badge--open"}`}>
                  {yearClosed ? "Closed" : "Open"}
                </span>
              </div>
            </div>

            <div className={`settings-stat ${activeFeeStructure ? "settings-stat--green" : "settings-stat--amber"}`}>
              <div className="settings-stat-label">Fee structure</div>
              <div className="settings-stat-value">
                <span className={`badge ${activeFeeStructure ? "badge--active" : "badge--no"}`}>
                  {activeFeeStructure ? "Active" : "Not set"}
                </span>
              </div>
            </div>

            <div className={`settings-stat ${promotionLocked ? "settings-stat--green" : "settings-stat--neutral"}`}>
              <div className="settings-stat-label">Promotions run</div>
              <div className="settings-stat-value">
                <span className={`badge ${promotionLocked ? "badge--yes" : "badge--no"}`}>
                  {promotionLocked ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* System Information card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon icon-gray">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="5.5" stroke="#6b7280" strokeWidth="1.2" />
                <path d="M8 5v3.5l2 1.5" stroke="#6b7280" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="settings-card-title">System information</span>
          </div>

          <div className="settings-stat-row">
            <div className="settings-stat settings-stat--neutral">
              <div className="settings-stat-label">Environment</div>
              <div className="settings-stat-value" style={{ fontSize: "13px" }}>Cloud (PostgreSQL)</div>
            </div>

            <div className="settings-stat settings-stat--neutral">
              <div className="settings-stat-label">Storage</div>
              <div className="settings-stat-value" style={{ fontSize: "13px" }}>Remote backend</div>
            </div>

            <div className={`settings-stat ${yearClosed ? "settings-stat--red" : "settings-stat--green"}`}>
              <div className="settings-stat-label">Reports mode</div>
              <div className="settings-stat-value">
                <span className={`badge ${yearClosed ? "badge--readonly" : "badge--editable"}`}>
                  {yearClosed ? "Read-only" : "Editable"}
                </span>
              </div>
            </div>

            <div className={`settings-stat ${yearClosed ? "settings-stat--red" : "settings-stat--neutral"}`}>
              <div className="settings-stat-label">Data lock</div>
              <div className="settings-stat-value">
                <span className={`badge ${yearClosed ? "badge--closed" : "badge--inactive"}`}>
                  {yearClosed ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* =========================
          Actions row
      ========================= */}
      <p className="settings-section-label">Actions</p>

      <div className="settings-grid-cards">

        {/* Academic Year Management card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon icon-red">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2.5" y="3.5" width="11" height="9" rx="1" stroke="#ef4444" strokeWidth="1.2" />
                <path d="M5 3.5V2.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="#ef4444" strokeWidth="1.2" />
                <path d="M6.5 7v3M9.5 7v3" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="settings-card-title">Academic year management</span>
          </div>

          <p className="settings-description">
            Closing the academic year finalizes all promotions and locks data
            permanently. This cannot be undone.
          </p>

          {yearClosed && (
            <p className="settings-description">
              Academic year is closed. No further changes are allowed.
            </p>
          )}

          <div className="settings-actions">
            <button
              className="settings-btn settings-btn--danger"
              disabled={yearClosed}
              onClick={handleCloseAcademicYear}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v8M5 7l3 3 3-3" stroke="#b91c1c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="2" y="12" width="12" height="2" rx="1" fill="#b91c1c" />
              </svg>
              Close academic year
            </button>

            <button
              className="settings-btn settings-btn--neutral"
              onClick={createNextYear}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="5.5" stroke="#374151" strokeWidth="1.2" />
                <path d="M8 5v6M5 8h6" stroke="#374151" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              Create next academic year
            </button>
          </div>
        </div>

        {/* Promotions card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon icon-amber">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L3 13h10L8 2z" stroke="#f59e0b" strokeWidth="1.2" strokeLinejoin="round" />
                <path d="M8 6v3.5M8 11v.5" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            <span className="settings-card-title">Promotions</span>
          </div>

          <p className="settings-description">
            Advances all eligible students to the next class. Class 10 students
            are marked as alumni. This runs only once per academic year.
          </p>

          <div className="settings-actions">
            <button
              className="settings-btn settings-btn--danger"
              disabled={promotionLocked || yearClosed}
              onClick={handleRunBulkPromotion}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9.5 4.5L13 8l-3.5 3.5" stroke="#b91c1c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Run bulk promotion (once)
            </button>
          </div>
        </div>

        {/* Fee Structure card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon icon-teal">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="4" width="12" height="9" rx="1" stroke="#10b981" strokeWidth="1.2" />
                <path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="#10b981" strokeWidth="1.2" />
                <path d="M5.5 8.5l1.5 1.5 3.5-3" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="settings-card-title">Fee structure</span>
          </div>

          <div className="settings-stat-row">
            <div className={`settings-stat ${activeFeeStructure ? "settings-stat--green" : "settings-stat--amber"}`}>
              <div className="settings-stat-label">Status</div>
              <div className="settings-stat-value">
                <span className={`badge ${activeFeeStructure ? "badge--active" : "badge--no"}`}>
                  {activeFeeStructure ? "Active" : "Not set"}
                </span>
              </div>
            </div>

            <div className="settings-stat settings-stat--blue">
              <div className="settings-stat-label">Session</div>
              <div className="settings-stat-value" style={{ fontSize: "13px" }}>{academicYearName || "—"}</div>
            </div>
          </div>

          <div className="settings-actions">
            <button
              className="settings-btn settings-btn--teal"
              disabled={yearClosed}
              onClick={() => navigate("/feestructure")}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="#15803d" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              Manage fee structures
            </button>
          </div>
        </div>

        {/* Recent System Activity card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon icon-purple">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="3" y="3" width="10" height="2" rx="1" fill="#8b5cf6" />
                <rect x="3" y="7" width="7" height="2" rx="1" fill="#8b5cf6" />
                <rect x="3" y="11" width="5" height="2" rx="1" fill="#8b5cf6" />
              </svg>
            </div>
            <span className="settings-card-title">Recent system activity</span>
          </div>

          {logs.length === 0 && (
            <p className="settings-description">No system-level actions recorded yet.</p>
          )}

          <div className="settings-log-container">
            {logs.map((log) => (
              <div key={log.id} className="settings-log-item">
                <span className="settings-log-time">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
                <span className="settings-log-event">
                  {(log.event ?? "").replaceAll("_", " ")}
                </span>
                <span className="settings-log-entity">{log.entityType}</span>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="settings-actions" style={{ marginTop: "12px" }}>
              <button
                className="settings-btn settings-btn--neutral"
                onClick={() => loadMoreLogs()}
                disabled={loading}
              >
                {loading ? "Loading..." : "Load older logs"}
              </button>
            </div>
          )}
        </div>

      </div>

      <hr className="settings-divider" />

      <AcademicYearTimeline />
    </div>
  );
}

export default SettingsPage;