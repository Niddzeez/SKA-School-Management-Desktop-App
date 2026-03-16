import { useParams, useNavigate } from "react-router-dom";
import type { Student } from "../../types/Student";
import "../../styles/Students.css";
import { useStudents } from "../../context/StudentContext";
import { useClasses } from "../../context/ClassContext";
import { useSections } from "../../context/SectionContext";
import { useState, useEffect } from "react";
import { useFeeLedger } from "../../context/FeeLedgerContext";
import { useFeeStructures } from "../../context/FeeStructureContext";
import { useAcademicYear, CURRENT_YEAR } from "../../context/AcademicYearContext";
import { useAuth } from "../../context/AuthContext";
import { can } from "../../auth/permissions";

function getInitials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function StudentDetails() {
  const navigate = useNavigate();
  const { id }   = useParams<{ id: string }>();

  const { students, UpdateStudentStatus, assignStudenttoSection } = useStudents();
  const { classes }   = useClasses();
  const { sections }  = useSections();
  const { role }      = useAuth();

  const {
    getLedgerByStudentYear,
    getLedgerSummary,
    payments,
    adjustments,
    addPayment,
    addAdjustment,
    upsertLedgerFromFeeStructure,
  } = useFeeLedger();

  const {
    academicYear,
    setAcademicYear,
    availableYears,
    isYearClosed,
  } = useAcademicYear();

  const { getActiveFeeStructure, feeStructures } = useFeeStructures();

  const student: Student | undefined = students.find((s) => s.id === id);
  if (!student) return <div className="student-detail-page">Student not found</div>;

  /* ── Local UI state ── */
  const [tempClassID,   setTempClassID]   = useState("");
  const [tempSectionID, setTempSectionID] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode,   setPaymentMode]   = useState<"CASH"|"UPI"|"BANK"|"CARD"|"CHEQUE">("CASH");
  const [reference,     setReference]     = useState("");
  const [adjType,       setAdjType]       = useState<"DISCOUNT"|"CONCESSION"|"WAIVER"|"EXTRA"|"LATE_FEE">("DISCOUNT");
  const [adjAmount,     setAdjAmount]     = useState("");
  const [adjReason,     setAdjReason]     = useState("");

  /* ── Derived data ── */
  const getNextAcademicYear = (year: string) => {
    const [start, end] = year.split("-").map(Number);
    return `${start + 1}-${end + 1}`;
  };

  const ledger             = getLedgerByStudentYear(student.id, academicYear);
  const summary            = ledger ? getLedgerSummary(ledger.id) : null;
  const studentPayments    = ledger ? payments.filter((p) => p.ledgerId === ledger.id) : [];
  const studentAdjustments = ledger ? adjustments.filter((a) => a.ledgerId === ledger.id) : [];
  const pendingAmount      = summary?.pending ?? 0;
  const isReadOnly         = academicYear !== CURRENT_YEAR || isYearClosed(academicYear);
  const isClassEditable    = student.status === "Active";

  const assignedClass   = classes.find((c) => c.id === student.classID);
  const assignedSection = sections.find((s) => s.id === student.sectionID);

  /* ── Ledger upsert ──
     Fixed: added feeStructures to deps so effect re-runs
     when a fee structure is activated after page loads    */
  useEffect(() => {
    if (!student)                    return;
    if (student.status !== "Active") return;

    if (!student.classID) {
      console.warn("[FeeSetup] student.classID is empty — assign the student to a class first");
      return;
    }

    const activeFeeStructure = getActiveFeeStructure(student.classID, academicYear);

    if (!activeFeeStructure) {
      console.warn(
        `[FeeSetup] No ACTIVE fee structure found for classID="${student.classID}" year="${academicYear}". ` +
        `Make sure the fee structure is ACTIVATED (not just DRAFT).`
      );
      return;
    }

    upsertLedgerFromFeeStructure(
      student.id,
      student.classID,
      academicYear,
      activeFeeStructure.components.map((c) => ({
        name:   c.name,
        amount: c.amount,
      }))
    );
  }, [
    student,
    academicYear,
    feeStructures,              // re-run when fee structures change
    getActiveFeeStructure,
    upsertLedgerFromFeeStructure,
  ]);

  /* ── Status handlers ── */
  const handleDeactivate = () => {
    if (!role || !can(role, "WITHDRAW_STUDENT")) { alert("You do not have permission."); return; }
    UpdateStudentStatus(student.id, "Inactive");
    navigate("/students");
  };

  const handleActivate = () => {
    if (!role || !can(role, "WITHDRAW_STUDENT")) { alert("You do not have permission."); return; }
    UpdateStudentStatus(student.id, "Active");
    navigate("/students");
  };

  const getNextClassId = (currentClassId: string) => {
    const sorted = [...classes].sort((a, b) => Number(a.ClassName) - Number(b.ClassName));
    const idx    = sorted.findIndex((c) => c.id === currentClassId);
    if (idx === -1 || idx === sorted.length - 1) return null;
    return sorted[idx + 1].id;
  };

  const handlePromote = () => {
    if (!role || can(role, "PROMOTE_STUDENT")) { alert("You do not have permission."); return; }
    if (!student.classID || student.status !== "Active") return;
    const nextClassId = getNextClassId(student.classID);
    if (!nextClassId) { alert("Student is already in the final class."); return; }
    const nextAY = getNextAcademicYear(academicYear);
    assignStudenttoSection(student.id, nextClassId, "");
    const nextFS = getActiveFeeStructure(nextClassId, nextAY);
    if (!nextFS) { console.warn("No active fee structure for promoted class/year."); return; }
    upsertLedgerFromFeeStructure(
      student.id, nextClassId, nextAY,
      nextFS.components.map((c) => ({ name: c.name, amount: c.amount }))
    );
  };

  const handleWithdraw = () => {
    if (!role || !can(role, "WITHDRAW_STUDENT")) { alert("You do not have permission."); return; }
    const confirmed = window.confirm(
      "This will mark the student as withdrawn. This action cannot be undone. Continue?"
    );
    if (!confirmed) return;
    UpdateStudentStatus(student.id, "Withdrawn");
    navigate("/students");
  };

  const initials = getInitials(student.firstName, student.lastName);

  const statusClass =
    student.status === "Active"    ? "sd-status-active"    :
    student.status === "Withdrawn" ? "sd-status-withdrawn" :
    "sd-status-inactive";

  /* ── Render ── */
  return (
    <div className={`student-detail-page${student.status === "Withdrawn" ? " withdrawn" : ""}`}>

      <button className="back-button" onClick={() => navigate("/students")}>
        ← Back to Students
      </button>

      <div className="sd-card">

        {/* ── Banner ── */}
        <div className="sd-banner">
          <div className="sd-banner-avatar">{initials}</div>
          <div className="sd-banner-info">
            <div className="sd-banner-name">
              {student.firstName} {student.lastName}
            </div>
            <div className="sd-banner-sub">
              {assignedClass
                ? `Class ${assignedClass.ClassName}${assignedSection ? ` · Section ${assignedSection.name}` : ""}`
                : "Class not assigned"}
              {" · "}Smart Kids Academy
            </div>
          </div>
          <div className="sd-banner-status">
            <span className={statusClass}>● {student.status.toUpperCase()}</span>
          </div>
        </div>

        {/* ── Action bar ── */}
        <div className="sd-actions">
          {student.status === "Active" && role && can(role, "WITHDRAW_STUDENT") && (
            <>
              <button className="sd-danger-btn" onClick={handleDeactivate}>Deactivate</button>
              <button className="sd-danger-btn" onClick={handleWithdraw}>Withdraw Student</button>
            </>
          )}
          {student.status === "Inactive" && role && can(role, "WITHDRAW_STUDENT") && (
            <button className="sd-primary-btn" onClick={handleActivate}>Activate</button>
          )}
          <button
            className="sd-secondary-btn"
            onClick={() => navigate("/admission/print", { state: { student } })}
          >
            Re-print Admission Form
          </button>
          <button
            className="sd-secondary-btn"
            onClick={() => navigate(`/students/${student.id}/statement`)}
          >
            Print Fee Statement
          </button>
        </div>

        {/* ── Personal Info ── */}
        <div className="sd-section">
          <div className="sd-section-title">Personal Information</div>
          <div className="sd-detail-grid">

            <div className="sd-detail-item">
              <div className="sd-detail-label">Student ID</div>
              <div className="sd-detail-value" style={{ fontSize: 12, fontFamily: "monospace" }}>
                {student.id}
              </div>
            </div>

            <div className="sd-detail-item">
              <div className="sd-detail-label">Gender</div>
              <div className={`sd-detail-value${!student.gender ? " muted" : ""}`}>
                {student.gender || "—"}
              </div>
            </div>

            <div className="sd-detail-item">
              <div className="sd-detail-label">Date of Birth</div>
              <div className={`sd-detail-value${!student.dateOfBirth ? " muted" : ""}`}>
                {student.dateOfBirth || "—"}
              </div>
            </div>

            <div className="sd-detail-item">
              <div className="sd-detail-label">Phone</div>
              <div className={`sd-detail-value${!student.phoneNumber ? " muted" : ""}`}>
                {student.phoneNumber || "—"}
              </div>
            </div>

            <div className="sd-detail-item">
              <div className="sd-detail-label">Admission Date</div>
              <div className={`sd-detail-value${!student.academic?.dateOfAdmission ? " muted" : ""}`}>
                {student.academic?.dateOfAdmission || "—"}
              </div>
            </div>

            {student.address && (
              <div className="sd-detail-item">
                <div className="sd-detail-label">City / State</div>
                <div className="sd-detail-value">
                  {[student.address.city, student.address.state].filter(Boolean).join(", ") || "—"}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Parents ── */}
        <div className="sd-section">
          <div className="sd-section-title">Parents / Guardian</div>
          <div className="sd-detail-grid">

            <div className="sd-detail-item">
              <div className="sd-detail-label">Father's Name</div>
              <div className="sd-detail-value">{student.father?.name || "—"}</div>
            </div>

            <div className="sd-detail-item">
              <div className="sd-detail-label">Father's Phone</div>
              <div className="sd-detail-value">{student.father?.phone || "—"}</div>
            </div>

            <div className="sd-detail-item">
              <div className="sd-detail-label">Father's Occupation</div>
              <div className={`sd-detail-value${!student.father?.occupation ? " muted" : ""}`}>
                {student.father?.occupation || "—"}
              </div>
            </div>

            <div className="sd-detail-item">
              <div className="sd-detail-label">Father's Education</div>
              <div className={`sd-detail-value${!student.father?.education ? " muted" : ""}`}>
                {student.father?.education || "—"}
              </div>
            </div>

            <div className="sd-detail-item">
              <div className="sd-detail-label">Mother's Name</div>
              <div className="sd-detail-value">{student.mother?.name || "—"}</div>
            </div>

            <div className="sd-detail-item">
              <div className="sd-detail-label">Mother's Phone</div>
              <div className="sd-detail-value">{student.mother?.phone || "—"}</div>
            </div>

          </div>
        </div>

        {/* ── Class & Section ── */}
        <div className="sd-section">
          <div className="sd-section-title">Class & Section</div>

          <div style={{ marginBottom: 12, fontSize: 13.5, fontWeight: 700, color: "#0f1c2e" }}>
            Currently:{" "}
            {assignedClass
              ? `Class ${assignedClass.ClassName}${assignedSection ? ` · Section ${assignedSection.name}` : " · Section not assigned"}`
              : "Not Assigned"}
          </div>

          <div className="assignment-row">
            <select
              disabled={!isClassEditable}
              value={tempClassID}
              onChange={(e) => { setTempClassID(e.target.value); setTempSectionID(""); }}
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>Class {cls.ClassName}</option>
              ))}
            </select>

            <select
              value={tempSectionID}
              disabled={!tempClassID}
              onChange={(e) => setTempSectionID(e.target.value)}
            >
              <option value="">Select Section</option>
              {sections
                .filter((s) => s.classID === tempClassID)
                .map((s) => (
                  <option key={s.id} value={s.id}>Section {s.name}</option>
                ))}
            </select>

            <button
              disabled={
                !tempClassID || !tempSectionID || !isClassEditable ||
                !role || !can(role, "ASSIGN_CLASS")
              }
              onClick={() => {
                assignStudenttoSection(student.id, tempClassID, tempSectionID);
                setTempClassID("");
                setTempSectionID("");
              }}
            >
              Assign
            </button>
          </div>

          {student.status === "Active" && role && can(role, "PROMOTE_STUDENT") && (
            <div style={{ marginTop: 12 }}>
              <button
                className="sd-primary-btn"
                disabled={isReadOnly}
                onClick={handlePromote}
              >
                Promote to Next Class
              </button>
            </div>
          )}
        </div>

        {/* ── Fees ── */}
        <div className="sd-section">
          <div className="sd-section-title">
            Fees
            <select
              className="sd-year-select"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              style={{ marginLeft: "auto" }}
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Read-only banners */}
          {isYearClosed(academicYear) && (
            <div className="sd-readonly-banner">
              This academic year is closed — view is read-only.
            </div>
          )}

          {isReadOnly && !isYearClosed(academicYear) && (
            <div className="sd-readonly-banner">
              Viewing a past academic year — read-only.
            </div>
          )}

          {/* Diagnostic: no class assigned */}
          {!student.classID && (
            <div
              className="sd-readonly-banner"
              style={{ borderColor: "#fca5a5", background: "#fef2f2", color: "#b91c1c" }}
            >
              ⚠ Student has no class assigned. Assign a class above — the fee will load automatically.
            </div>
          )}

          {/* Diagnostic: no active fee structure */}
          {student.classID && !getActiveFeeStructure(student.classID, academicYear) && (
            <div
              className="sd-readonly-banner"
              style={{ borderColor: "#fde68a", background: "#fffbeb", color: "#92400e" }}
            >
              ⚠ No active fee structure for this class and year ({academicYear}).
              Go to Fee Structures → create a structure → add components → click Activate.
            </div>
          )}

          {/* Fee structure exists but ledger not created yet */}
          {student.classID && getActiveFeeStructure(student.classID, academicYear) && !ledger && (
            <p style={{ color: "#8e9ab5", fontSize: 13, fontStyle: "italic" }}>
              Setting up fee ledger…
            </p>
          )}

          {/* Fee summary */}
          {ledger && summary && (
            <div className="sd-fee-card">
              <div>
                <div className="sd-fee-item-label">Base Fee</div>
                <div className="sd-fee-item-value">
                  ₹{summary.baseTotal.toLocaleString("en-IN")}
                </div>
              </div>
              <div>
                <div className="sd-fee-item-label">Adjustments</div>
                <div className="sd-fee-item-value">
                  ₹{summary.adjustmentsTotal.toLocaleString("en-IN")}
                </div>
              </div>
              <div>
                <div className="sd-fee-item-label">Final Fee</div>
                <div className="sd-fee-item-value">
                  ₹{summary.finalFee.toLocaleString("en-IN")}
                </div>
              </div>
              <div>
                <div className="sd-fee-item-label">Paid</div>
                <div className="sd-fee-item-value paid">
                  ₹{summary.paidTotal.toLocaleString("en-IN")}
                </div>
              </div>
              <div>
                <div className="sd-fee-item-label">Pending</div>
                <div className="sd-fee-item-value pending">
                  ₹{summary.pending.toLocaleString("en-IN")}
                </div>
              </div>
              <div>
                <div className="sd-fee-item-label">Status</div>
                <div className={`sd-fee-item-value status-${summary.status.toLowerCase()}`}>
                  {summary.status}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Adjustments ── */}
        {ledger && role && can(role, "ADD_ADJUSTMENT") && (
          <div className="sd-section">
            <div className="sd-section-title">Adjustments</div>

            {studentAdjustments.length === 0 && (
              <p style={{ color: "#8e9ab5", fontSize: 13, fontStyle: "italic", marginBottom: 10 }}>
                No adjustments applied.
              </p>
            )}

            {studentAdjustments.map((a) => (
              <div key={a.id} className="adjustment-row">
                <strong>{a.type}</strong>{" "}
                ({a.amount < 0 ? "-" : "+"}₹{Math.abs(a.amount).toLocaleString("en-IN")})
                <br />
                <small>{a.reason} — Approved by {a.approvedBy}</small>
              </div>
            ))}

            <div className="adjustment-form">
              <h4>Add Adjustment</h4>
              <select
                value={adjType}
                onChange={(e) => setAdjType(e.target.value as any)}
              >
                <option value="DISCOUNT">Discount</option>
                <option value="CONCESSION">Concession</option>
                <option value="WAIVER">Waiver</option>
                <option value="EXTRA">Extra</option>
                <option value="LATE_FEE">Late Fee</option>
              </select>
              <input
                type="number"
                placeholder="Amount"
                value={adjAmount}
                onChange={(e) => setAdjAmount(e.target.value)}
              />
              <input
                type="text"
                placeholder="Reason"
                value={adjReason}
                onChange={(e) => setAdjReason(e.target.value)}
              />
              <button
                disabled={!adjAmount || !adjReason || isReadOnly}
                onClick={() => {
                  const raw = Number(adjAmount);
                  if (!raw) return;
                  const signed =
                    adjType === "EXTRA" || adjType === "LATE_FEE"
                      ? Math.abs(raw)
                      : -Math.abs(raw);
                  addAdjustment({
                    ledgerId: ledger.id,
                    type: adjType,
                    amount: signed,
                    reason: adjReason,
                    approvedBy: "Admin",
                  });
                  setAdjAmount("");
                  setAdjReason("");
                  setAdjType("DISCOUNT");
                }}
              >
                Apply Adjustment
              </button>
            </div>
          </div>
        )}

        {/* ── Payments ── */}
        <div className="sd-section">
          <div className="sd-section-title">Payments</div>

          {ledger && studentPayments.length === 0 && (
            <p style={{ color: "#8e9ab5", fontSize: 13, fontStyle: "italic", marginBottom: 10 }}>
              No payments yet.
            </p>
          )}

          {ledger && studentPayments.length > 0 && !isReadOnly && (
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Reference</th>
                  <th>Collected By</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {studentPayments.map((p) => (
                  <tr key={p.id}>
                    <td>{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                    <td style={{ fontWeight: 700, color: "#00845a" }}>
                      ₹{p.amount.toLocaleString("en-IN")}
                    </td>
                    <td>{p.mode}</td>
                    <td>{p.reference || "—"}</td>
                    <td>{p.collectedBy}</td>
                    <td>
                      <button
                        className="link-btn"
                        onClick={() => navigate(`/receipts/${p.id}`)}
                      >
                        View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {ledger && pendingAmount > 0 && role && can(role, "ADD_PAYMENT") && (
            <div className="payment-form">
              <h4>Add Payment</h4>
              <input
                type="number"
                placeholder="Amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as any)}
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="BANK">Bank</option>
                <option value="CARD">Card</option>
                <option value="CHEQUE">Cheque</option>
              </select>
              <input
                type="text"
                placeholder="Reference"
                disabled={paymentMode === "CASH"}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
              {isYearClosed(ledger.academicYear) && (
                <p className="warning">
                  This payment will be recorded as a late settlement.
                </p>
              )}
              <button
                disabled={
                  isReadOnly ||
                  !paymentAmount ||
                  Number(paymentAmount) <= 0 ||
                  Number(paymentAmount) > pendingAmount
                }
                onClick={() => {
                  addPayment({
                    ledgerId:    ledger.id,
                    studentId:   student.id,
                    amount:      Number(paymentAmount),
                    mode:        paymentMode,
                    reference:   reference || undefined,
                    collectedBy: "Admin",
                  });
                  setPaymentAmount("");
                  setReference("");
                }}
              >
                Add Payment
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default StudentDetails;