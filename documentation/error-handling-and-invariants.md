# Error Handling and Invariant Enforcement

## Smart Kids Academy – Frontend Correctness Specification

---

## 1. Purpose of This Document

This document defines **what the system explicitly refuses to do**, and **why**.

Unlike feature documentation, this focuses on:

* Illegal states
* Forbidden operations
* Defensive design decisions
* Correctness guarantees

These rules ensure that the frontend cannot silently corrupt academic or financial data.

---

## 2. Core Philosophy: Prevent, Don’t Repair

The frontend is designed to **prevent invalid states from ever being created**, rather than attempting to fix them later.

This is achieved by:

* Strong domain invariants
* Context-level guards
* UI-level disabling of invalid actions

Errors are treated as **design violations**, not user mistakes.

---

## 3. Types of Invariants

The system enforces invariants at three levels:

1. **Domain invariants** – Rules that must never be violated
2. **Temporal invariants** – Rules dependent on time / academic year
3. **Financial invariants** – Rules protecting monetary correctness

---

## 4. Student Domain Invariants

### 4.1 Student Status Invariants

Rules:

* A student must be ACTIVE to participate in financial workflows
* INACTIVE students are excluded from ledger creation

Enforcement:

* Ledger creation checks student status
* UI disables fee-related actions for inactive students

---

### 4.2 Class & Section Assignment Invariants

Rules:

* A student can belong to only one class at a time
* A student can belong to only one section at a time

Enforcement:

* Assignment operation overwrites previous mapping
* No partial assignments are allowed

---

## 5. Academic Year Invariants (Temporal Safety)

### 5.1 Read-Only Year Enforcement

Rules:

* Past or closed academic years are immutable

Enforcement:

* `AcademicYearContext.isYearClosed()` determines mutability
* All mutation UI elements are disabled for read-only years

---

### 5.2 Cross-Year Isolation

Rules:

* Data from one academic year must not affect another

Enforcement:

* Ledgers are keyed by `(studentId, academicYear)`
* Year switching triggers re-evaluation of all views

---

## 6. Fee Structure Invariants

### 6.1 Single Active Structure Rule

Rules:

* Only one ACTIVE fee structure per class per academic year

Enforcement:

* Activation logic demotes other structures automatically

---

### 6.2 Immutability of Active Structures

Rules:

* ACTIVE fee structures cannot be edited

Enforcement:

* UI hides edit/remove actions
* Context-level checks ignore illegal mutations

---

## 7. Ledger Invariants (Critical)

### 7.1 One Ledger per Student per Year

Rules:

* Duplicate ledgers are forbidden

Enforcement:

* Context throws error on duplicate creation

---

### 7.2 Ledger Freeze-on-Payment Rule

Rules:

* Once a payment exists, base fee components must not change

Enforcement:

* `upsertLedgerFromFeeStructure()` stops updates after payment

---

### 7.3 Append-Only Financial History

Rules:

* Payments, adjustments, and expenses are never edited or deleted

Enforcement:

* Contexts only expose add operations
* No update or delete APIs exist

---

## 8. Payment Invariants

### 8.1 Amount Validation

Rules:

* Payment amount must be positive
* Payment amount must not exceed pending balance

Enforcement:

* UI validation
* Context-level guards

---

### 8.2 Mode-Specific Constraints

Rules:

* Non-cash payments require reference information

Enforcement:

* UI disables submission until reference is provided

---

## 9. Adjustment Invariants

Rules:

* Adjustments must be explicitly typed
* Signed amounts must match adjustment type
* Reason and approver are mandatory

Enforcement:

* UI enforces input completeness
* Context signs values deterministically

---

## 10. Reporting & Derived View Safety

Rules:

* Reports must not mutate state
* Reports must be reproducible

Enforcement:

* Reports use selector utilities only
* No context mutation inside report components

---

## 11. Error Handling Strategy

### 11.1 UI-Level Errors

Used for:

* Missing inputs
* Invalid user actions

Handled by:

* Disabled buttons
* Inline warnings

---

### 11.2 Context-Level Errors

Used for:

* Invariant violations
* Illegal state transitions

Handled by:

* Throwing explicit errors
* Preventing state mutation

---

## 12. What the System Explicitly Refuses to Do

* Modify historical financial data
* Delete payments or adjustments
* Apply fees retroactively after payment
* Mutate data in closed academic years
* Allow partial or ambiguous assignments

These refusals are **intentional design choices**.

---

## 13. Backend Enforcement Alignment

All frontend invariants are designed to be **mirrored and enforced** by the backend.

Frontend enforcement exists to:

* Prevent accidental misuse
* Improve user feedback

Backend enforcement will provide final authority.

---

## 14. Conclusion

This frontend treats correctness as a first-class concern.

Errors are not patched over — they are **prevented by design**.

These invariant rules form the foundation for reliable backend integration and trustworthy financial data.
