# Frontend Data Flow Documentation

## Smart Kids Academy – Behavioral Flow Specification

---

## 1. Purpose of This Document

This document explains **how data moves through the frontend system** when real users perform real actions.

While previous documents describe *structure* (architecture, routes, models), this document describes **behavior**:

* What happens when a user submits a form
* How state changes propagate
* How invariants are enforced
* How multiple contexts interact safely

This document is essential for:

* Backend API derivation
* Correctness reasoning
* Defending system design decisions

---

## 2. Data Flow Philosophy

All frontend data flows follow a strict pattern:

```
User Action
 → Page-level handler
 → Context mutation function
 → Persistent state update
 → Derived selectors
 → UI re-render / navigation
```

Key guarantees:

* Pages never mutate state directly
* Contexts own all domain data
* Derived data is computed, never stored redundantly

---

## 3. Student Admission Flow

### Trigger

Admin submits the **Admission Form**.

### Flow

1. User fills admission form
2. Form data is validated at UI level
3. Form data is mapped to a `Student` domain model
4. `StudentContext.addStudent(student)` is invoked
5. Persistent state is updated via `usePersistentState`
6. Students list re-renders automatically
7. Navigation redirects to student list or details

### Notes

* No fee ledger is created at this stage
* Admission is decoupled from financial logic

---

## 4. Class & Section Assignment Flow

### Trigger

Admin assigns a student to a class and section.

### Flow

1. User selects class and section
2. UI validates selection completeness
3. `StudentContext.assignStudenttoSection(studentId, classId, sectionId)` is called
4. Student record is updated atomically
5. UI re-renders showing new assignment

### Invariants

* A student can belong to only one class and one section at a time
* Reassignment overwrites previous assignment

---

## 5. Fee Structure Definition Flow

### Trigger

Admin creates or edits a fee structure.

### Flow

1. Admin creates a draft fee structure
2. Fee components are added or removed
3. Structure remains mutable while in DRAFT state
4. Admin activates the structure
5. All other structures for same class/year are demoted to DRAFT

### Invariants

* Only one ACTIVE fee structure per class/year
* ACTIVE structures are immutable

---

## 6. Ledger Creation & Synchronization Flow

### Trigger

A student becomes eligible for fee processing.

### Flow

1. Student is ACTIVE and assigned to a class
2. Academic year is selected
3. System checks for ACTIVE fee structure
4. `FeeLedgerContext.upsertLedgerFromFeeStructure(...)` is invoked

Cases:

* No existing ledger → create new ledger
* Ledger exists, no payments → update base components
* Ledger exists, payments exist → no changes (freeze)

### Guarantee

Fee ledgers always reflect the fee structure *at the time of first payment*.

---

## 7. Fee Payment Flow

### Trigger

Admin records a payment for a student.

### Flow

1. Admin enters payment amount and mode
2. UI validates amount and read-only status
3. `FeeLedgerContext.addPayment(payment)` is invoked
4. Payment is appended with timestamp
5. Receipt number is generated
6. Ledger summary recalculates automatically
7. UI updates payment history and pending amount

### Invariants

* Payments are append-only
* Payment amount must be positive
* Payments cannot exceed pending balance

---

## 8. Ledger Adjustment Flow

### Trigger

Admin applies a discount, waiver, or penalty.

### Flow

1. Adjustment type and amount are selected
2. Amount is signed based on adjustment type
3. Reason and approval are required
4. `FeeLedgerContext.addAdjustment(adjustment)` is called
5. Ledger summary recalculates automatically

### Invariants

* Adjustments are never deleted
* All adjustments are auditable

---

## 9. Academic Year Switching Flow

### Trigger

Admin switches academic year.

### Flow

1. `AcademicYearContext.setAcademicYear(year)` is invoked
2. All dependent pages re-evaluate data
3. Read-only flags are recomputed

### Special Case: Year Closure

1. Admin closes an academic year
2. Year is marked read-only
3. All mutation actions are disabled in UI

---

## 10. Student Promotion Flow

### Trigger

Admin promotes a student to the next class.

### Flow

1. Current class ordering is evaluated
2. Next class is determined
3. Student class assignment is updated
4. Next academic year is computed
5. Fee ledger is initialized if structure exists

### Guarantee

Promotion never alters historical ledgers.

---

## 11. Reporting & Printing Flow

### Trigger

Admin generates reports or prints documents.

### Flow

1. User selects filters (year, range, type)
2. Selector utilities aggregate data
3. Print-safe layout is rendered
4. Browser print is triggered

### Guarantee

Reports are **purely derived views**.

---

## 12. Error Prevention & Guardrails

Errors are prevented via:

* UI-level validation
* Context-level invariant checks
* Read-only enforcement

Illegal state transitions are blocked before mutation.

---

## 13. Backend Readiness

Each flow maps cleanly to backend operations:

* Form submit → POST
* Mutation → Transaction
* Selector → Query

No frontend behavior relies on implementation quirks.

---

## 14. Conclusion

The frontend data flows are designed to be:

* Predictable
* Auditable
* Safe against accidental corruption

This document serves as the **behavioral specification** for both frontend and backend development.
