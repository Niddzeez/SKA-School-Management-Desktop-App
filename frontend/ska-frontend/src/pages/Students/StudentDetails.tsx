import { useParams, useNavigate } from "react-router-dom";
import type { Student } from "../../types/Student";
//import { students } from "../data/students";
import "../../styles/studentDetails.css";
import { useStudents } from "../../context/StudentContext";
import { useClasses } from "../../context/ClassContext";
import { useSections } from "../../context/SectionContext";
import { useState, useEffect } from "react";
import { useFeeLedger } from "../../context/FeeLedgerContext";
import { useFeeStructures } from "../../context/FeeStructureContext";
import { useAcademicYear, CURRENT_YEAR } from "../../context/AcademicYearContext";
import { useAuth} from "../../context/AuthContext"
import  {can} from "../../auth/permissions";


function StudentDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { students, UpdateStudentStatus, assignStudenttoSection } =
    useStudents();
  const { classes } = useClasses();
  const { sections } = useSections();

  const {role} = useAuth();

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


  const { getActiveFeeStructure } = useFeeStructures();


  const student: Student | undefined = students.find((s) => s.id === id);
  if (!student) return <div>Student not found</div>;

  /* =========================
     Local UI State
  ========================= */

  const [tempClassID, setTempClassID] = useState("");
  const [tempSectionID, setTempSectionID] = useState("");

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] =
    useState<"CASH" | "UPI" | "BANK" | "CARD" | "CHEQUE">("CASH");
  const [reference, setReference] = useState("");

  const [adjType, setAdjType] =
    useState<
      "DISCOUNT" | "CONCESSION" | "WAIVER" | "EXTRA" | "LATE_FEE"
    >("DISCOUNT");
  const [adjAmount, setAdjAmount] = useState("");
  const [adjReason, setAdjReason] = useState("");



  /* =========================
     Ledger & Derived Data
  ========================= */

  const getNextAcademicYear = (year: string) => {
    const [start, end] = year.split("-").map(Number);
    return `${start + 1}-${end + 1}`;
  };


  const ledger = getLedgerByStudentYear(student.id, academicYear);
  const summary = ledger ? getLedgerSummary(ledger.id) : null;

  const studentPayments = ledger
    ? payments.filter((p) => p.ledgerId === ledger.id)
    : [];

  const studentAdjustments = ledger
    ? adjustments.filter((a) => a.ledgerId === ledger.id)
    : [];

  const pendingAmount = summary?.pending ?? 0;

  const isReadOnly =
    academicYear !== CURRENT_YEAR || isYearClosed(academicYear);




  /* =========================
     🔒 Ledger Upsert Logic
  ========================= */

  useEffect(() => {
    if (!student) return;
    if (student.status !== "Active") return;
    if (!student.classID) return;

    const activeFeeStructure = getActiveFeeStructure(
      student.classID,
      academicYear
    );
    if (!activeFeeStructure) return;

    upsertLedgerFromFeeStructure(
      student.id,
      student.classID,
      academicYear,
      activeFeeStructure.components.map((c) => ({
        name: c.name,
        amount: c.amount,
      }))
    );
  }, [student, academicYear, getActiveFeeStructure, upsertLedgerFromFeeStructure]);

  /* =========================
     Status Handlers
  ========================= */

  const handleDeactivate = () => {
    if (!can(role, "WITHDRAW_STUDENT")) {
    alert("You do not have permission to perform this action.");
    return;
  }
    UpdateStudentStatus(student.id, "Inactive");
    navigate("/students");
  };

  const handleActivate = () => {
    if (!can(role, "WITHDRAW_STUDENT")) {
    alert("You do not have permission to perform this action.");
    return;
  }
    UpdateStudentStatus(student.id, "Active");
    navigate("/students");
  };

  const getNextClassId = (currentClassId: string) => {
    const sortedClasses = [...classes].sort(
      (a, b) => Number(a.ClassName) - Number(b.ClassName)
    );

    const index = sortedClasses.findIndex(
      (c) => c.id === currentClassId
    );

    if (index === -1 || index === sortedClasses.length - 1) {
      return null; // Last class
    }

    return sortedClasses[index + 1].id;
  };


  const handlePromote = () => {
    if (!can(role, "PROMOTE_STUDENT")) {
    alert("You do not have permission to perform this action.");
    return;
  }
    if (!student.classID || student.status !== "Active") return;


    const nextClassId = getNextClassId(student.classID);
    if (!nextClassId) {
      alert("Student is already in the final class.");
      return;
    }

    const nextAcademicYear = getNextAcademicYear(academicYear);

    // 1️⃣ Update student class (section cleared)
    assignStudenttoSection(student.id, nextClassId, "");

    // 2️⃣ Create ledger for new academic year (if possible)
    const nextFeeStructure = getActiveFeeStructure(
      nextClassId,
      nextAcademicYear
    );

    if (!nextFeeStructure) {
      console.warn(
        "No active fee structure for promoted class/year yet."
      );
      return;
    }

    upsertLedgerFromFeeStructure(
      student.id,
      nextClassId,
      nextAcademicYear,
      nextFeeStructure.components.map((c) => ({
        name: c.name,
        amount: c.amount,
      }))
    );
  };

  const handleWithdraw = () => {
    if (!can(role, "WITHDRAW_STUDENT")) {
    alert("You do not have permission to perform this action.");
    return;
  }
    const confirmed = window.confirm(
      "This will mark the student as withdrawn. This action cannot be undone. Continue?"
    );

    if (!confirmed) return;

    UpdateStudentStatus(student.id, "Withdrawn");
    navigate("/students");
  };

  const isClassEditable = student.status === "Active";


  /* =========================
     Render
  ========================= */

  return (
    <div className={`student-detail ${student.status === "Withdrawn" ? "withdrawn" : ""}`}>

      <button className="back-button" onClick={() => navigate("/students")}>
        Back to Students
      </button>

      <h2>
        {student.firstName} {student.lastName}
      </h2>

      <div className="student-actions">

        {student.status === "Active" && can(role, "WITHDRAW_STUDENT") && (
          <>
            <button className="danger-btn" onClick={handleDeactivate}>
              Deactivate
            </button>

            <button className="danger-btn" onClick={handleWithdraw}>
              Withdraw Student
            </button>
          </>
        )}

        {student.status === "Inactive" && can(role, "WITHDRAW_STUDENT") && (
          <button className="primary-btn" onClick={handleActivate}>
            Activate
          </button>
        )}

        {/* Withdrawn & Alumni → NO ACTIONS */}
      </div>



      {/* =========================
    Admission Details
========================= */}

      <h3>Admission Details</h3>

      <div className="admission-card">
        <p>
          <strong>Student ID:</strong> {student.id}
        </p>

        <p>
          <strong>Name:</strong> {student.firstName} {student.lastName}
        </p>

        {student.gender && (
          <p>
            <strong>Gender:</strong> {student.gender}
          </p>
        )}

        {student.phoneNumber && (
          <p>
            <strong>Phone:</strong> {student.phoneNumber}
          </p>
        )}

        {student.dateOfBirth && (
          <p>
            <strong>Date of Birth:</strong> {student.dateOfBirth}
          </p>
        )}

        {student.academic.dateOfAdmission && (
          <p>
            <strong>Admission Date:</strong> {student.academic.dateOfAdmission}
          </p>
        )}
      </div>

      {/* =========================
    Address
========================= */}

      {student.address && (
        <>
          <h4>Address</h4>
          <div className="admission-card">
            {student.address.city && (
              <p>
                <strong>City:</strong> {student.address.city}
              </p>
            )}
            {student.address.state && (
              <p>
                <strong>State:</strong> {student.address.state}
              </p>
            )}
            {student.address.city && (
              <p>
                <strong>Address:</strong> {student.address.addressLine}
              </p>
            )}
          </div>
        </>
      )}

      {/* =========================
    Parents
========================= */}

      <h4>Father</h4>
      <div className="admission-card">
        <p><strong>Name:</strong> {student.father.name}</p>
        <p><strong>Phone:</strong> {student.father.phone}</p>
        <p><strong>Occupation:</strong> {student.father.occupation}</p>
        <p><strong>Education:</strong> {student.father.education}</p>
      </div>

      <h4>Mother</h4>
      <div className="admission-card">
        <p><strong>Name:</strong> {student.mother.name}</p>
        <p><strong>Phone:</strong> {student.mother.phone}</p>
        <p><strong>Occupation:</strong> {student.mother.occupation}</p>
        <p><strong>Education:</strong> {student.mother.education}</p>
      </div>

      {/* =========================
          Class & Section
      ========================= */}

      <h3>Class & Section</h3>

      <strong>Assigned:</strong>{" "}
      {student.classID ? (
        <>
          Class {classes.find(c => c.id === student.classID)?.ClassName}
          {student.sectionID
            ? ` - Section ${sections.find(s => s.id === student.sectionID)?.name}`
            : " - Section not assigned"}
        </>
      ) : (
        "Not Assigned"
      )}


      <div className="assignment-row">
        <select
          disabled={!isClassEditable}
          value={tempClassID}
          onChange={(e) => {
            setTempClassID(e.target.value);
            setTempSectionID("");
          }}
        >
          <option value="">Select Class</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              Class {cls.ClassName}
            </option>
          ))}
        </select>

        <select
          value={tempSectionID}
          disabled={!tempClassID}
          onChange={(e) => setTempSectionID(e.target.value)}
        >
          <option value="">Select Section</option>
          {sections
            .filter((sec) => sec.classID === tempClassID)
            .map((sec) => (
              <option key={sec.id} value={sec.id}>
                Section {sec.name}
              </option>
            ))}
        </select>

        <button
          disabled={!tempClassID || !tempSectionID || !isClassEditable || !can(role, "ASSIGN_CLASS")} 
          onClick={() => {
            assignStudenttoSection(student.id, tempClassID, tempSectionID);
            setTempClassID("");
            setTempSectionID("");
          }}
        >
          Assign
        </button>

        {student.status === "Active" && can(role, "PROMOTE_STUDENT") && (
          <button
            disabled={isReadOnly}
            className="primary-btn"
            onClick={handlePromote}
            style={{ marginTop: "12px" }}
          >
            Promote to Next Class
          </button>
        )}





      </div>

      <h3>Admission Details</h3>

      <button
        className="secondary-btn"
        style={{ marginBottom: "12px" }}
        onClick={() =>
          navigate("/admission/print", {
            state: {
              student,
            },
          })
        }
      >
        Re-print Admission Form
      </button>

      {/* =========================
          Fees Summary
      ========================= */}
      <h3>Academic Year</h3>

      <select
        value={academicYear}
        onChange={(e) => setAcademicYear(e.target.value)}
      >
        {availableYears.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      {isYearClosed(academicYear) && (
        <p style={{ color: "red", marginTop: "4px" }}>
          This academic year is closed (read-only).
        </p>
      )}

      {isReadOnly && (
        <div
          style={{
            padding: "8px",
            background: "#fff3cd",
            border: "1px solid #ffeeba",
            marginBottom: "12px",
            fontSize: "0.9rem",
          }}
        >
          You are viewing a past or closed academic year.
          <br />
          This view is <strong>read-only</strong>.
        </div>
      )}




      <h3>Fees</h3>

      {!ledger && <p>No ledger found for {academicYear}</p>}

      {ledger && summary && (
        <div className="fees-card">
          <p><strong>Base:</strong> ₹{summary.baseTotal}</p>
          <p><strong>Adjustments:</strong> ₹{summary.adjustmentsTotal}</p>
          <p><strong>Final:</strong> ₹{summary.finalFee}</p>
          <p><strong>Paid:</strong> ₹{summary.paidTotal}</p>
          <p><strong>Pending:</strong> ₹{summary.pending}</p>
          <p><strong>Status:</strong> {summary.status}</p>
        </div>
      )}

      {/* =========================
          Adjustments
      ========================= */}

      {ledger &&  can(role, "ADD_ADJUSTMENT") && (
        <>
          <h4>Adjustments</h4>

          {studentAdjustments.length === 0 && (
            <p>No adjustments applied.</p>
          )}

          {studentAdjustments.map((a) => (
            <div key={a.id} className="adjustment-row">
              <strong>{a.type}</strong>{" "}
              ({a.amount < 0 ? "-" : "+"}₹{Math.abs(a.amount)})
              <br />
              <small>
                {a.reason} — Approved by {a.approvedBy}
              </small>
            </div>
          ))}


          <div className="adjustment-form">
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

        </>
      )}

      {/* =========================
          Payments
      ========================= */}

      <h3>Payments</h3>

      {ledger && studentPayments.length === 0 && (
        <p>No payments yet.</p>
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
              <th>Reciept</th>
            </tr>
          </thead>
          <tbody>
            {studentPayments.map((p) => (
              <tr key={p.id}>
                <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                <td>₹{p.amount}</td>
                <td>{p.mode}</td>
                <td>{p.reference || "-"}</td>
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

      <button
        className="secondary-btn"
        onClick={() =>
          navigate(`/students/${student.id}/statement`)
        }
      >
        Print Fee Statement
      </button>


      {ledger && pendingAmount > 0 && can(role, "ADD_PAYMENT") &&(
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
                ledgerId: ledger.id,
                studentId: student.id,
                amount: Number(paymentAmount),
                mode: paymentMode,
                reference: reference || undefined,
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
  );
}

export default StudentDetails;
