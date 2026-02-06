import { useAcademicYear } from "../../context/AcademicYearContext";
import "./AcademicYearTimeline.css";

function AcademicYearTimeline() {
  const {
    yearMeta,
    academicYear,
    isPromotionLocked,
    getPromotionSummary,
  } = useAcademicYear();

  // Defensive guard (important)
  if (!yearMeta || yearMeta.length === 0) {
    return (
      <section className="settings-section">
        <h2>Academic Year Timeline</h2>
        <p className="settings-description">
          No academic year history available yet.
        </p>
      </section>
    );
  }

  return (
    <section className="settings-section">
      <h2>Academic Year Timeline</h2>
      <p className="settings-description">
        Historical overview of academic years, promotions, and closures.
      </p>

      <div className="timeline">
        {yearMeta.map((year) => {
          const isCurrent = year.year === academicYear;
          const promotionLocked = isPromotionLocked(year.year);
          const summary = getPromotionSummary(year.year);

          return (
            <div
              key={year.year}
              className={`timeline-item ${
                isCurrent ? "current" : ""
              }`}
            >
              {/* ===== Header ===== */}
              <div className="timeline-header">
                <span className="timeline-year">
                  {year.year}
                </span>

                <span
                  className={`timeline-status ${
                    year.status === "CLOSED"
                      ? "closed"
                      : "open"
                  }`}
                >
                  {year.status}
                </span>
              </div>

              {/* ===== Details ===== */}
              <div className="timeline-body">
                {/* Closure info */}
                {year.status === "CLOSED" && year.closedAt && (
                  <p>
                    <strong>Closed on:</strong>{" "}
                    {new Date(year.closedAt).toLocaleDateString()}
                  </p>
                )}

                {/* Promotion status */}
                {promotionLocked ? (
                  <>
                    <p>
                      <strong>Promotion:</strong>{" "}
                      Completed
                    </p>

                    {summary ? (
                      <ul className="timeline-summary">
                        <li>
                          Promoted Students:{" "}
                          {summary.promotedCount}
                        </li>
                        <li>
                          Alumni:{" "}
                          {summary.alumniCount}
                        </li>
                        <li>
                          Promotion Date:{" "}
                          {new Date(
                            summary.promotedAt
                          ).toLocaleString()}
                        </li>
                      </ul>
                    ) : (
                      <p className="timeline-muted">
                        Promotion completed
                        (legacy data – summary not available)
                      </p>
                    )}
                  </>
                ) : (
                  <p>
                    <strong>Promotion:</strong>{" "}
                    Pending
                  </p>
                )}

                {/* Current year badge */}
                {isCurrent && (
                  <span className="timeline-badge">
                    Current Academic Year
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default AcademicYearTimeline;
