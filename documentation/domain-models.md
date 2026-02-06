# Domain Models Documentation

## Smart Kids Academy – Canonical Data Model Specification

---

## 1. Purpose of This Document

This document defines the **canonical domain models** used by the frontend of the Smart Kids Academy School Management System.

These models represent **real-world entities**, not UI components. They act as:

* The single source of truth for frontend data shape
* The contract boundary for future backend APIs
* The foundation for database schema design

All frontend contexts, pages, and utilities depend on these models.

---

## 2. Design Principles

The domain models follow these principles:

* **Explicitness**: Every important field is modeled explicitly
* **Stability**: Models change slowly and deliberately
* **Separation of concerns**: Financial, academic, and administrative data are separated
* **Backend parity**: Models are backend-ready

---

## 3. Core Academic Entities

### 3.1 Student

**Concept**: Represents an enrolled learner and their academic identity.

**Key Characteristics**:

* Exists independently of fees
* Has a lifecycle state (Active / Inactive)
* Is associated with a class and section

**Important Fields (Conceptual)**:

* `id` – Unique student identifier
* `firstName`, `lastName`
* `gender`, `dateOfBirth`
* `phoneNumber`
* `status` – Controls eligibility for fee ledger creation
* `academic` – Admission metadata
* `classID`, `sectionID` – Current academic placement
* `father`, `mother` – Parent details
* `address`

**Invariants**:

* A student may exist without a class assignment
* Only ACTIVE students participate in financial workflows

---

### 3.2 Teacher

**Concept**: Represents a faculty member.

**Key Characteristics**:

* Can be active or inactive
* May be assigned as a class teacher

**Important Fields**:

* `id`
* `name`
* `phone`, `email`
* `status`

**Notes**:

* Teachers do not directly interact with financial entities

---

### 3.3 Class

**Concept**: Represents an academic grade or level within the school.

**Key Characteristics**:

* Ordered numerically (used for promotion logic)
* Serves as the parent entity for sections and fee structures

**Important Fields**:

* `id`
* `ClassName` – Numeric or string representation of grade

**Invariants**:

* Class ordering must be consistent across the system
* Classes are immutable once students are assigned

---

### 3.4 Section

**Concept**: Subdivision of a class.

**Important Fields**:

* `id`
* `name`
* `classID`
* `classTeacherID`

**Invariant**:

* A section belongs to exactly one class

---

## 4. Financial Domain Entities (Critical)

### 4.1 FeeStructure / ClassFeeStructure

**Concept**: Defines the complete fee blueprint for a specific class in a specific academic year.

This model is sometimes referred to as **ClassFeeStructure**, emphasizing that it is scoped to a class.

**Key Characteristics**:

* Blueprint, not a transaction
* Snapshot-based usage
* Versioned implicitly via academic year

**Important Fields**:

* `id`
* `classID`
* `academicYear`
* `components: FeeComponent[]`
* `status` – DRAFT or ACTIVE
* `createdAt`

**Invariants**:

* Only one ACTIVE structure per class per academic year
* ACTIVE structures are immutable

---

### 4.2 FeeComponent

**Concept**: Individual fee line item.

**Fields**:

* `id`
* `name`
* `amount`

---

### 4.3 StudentFeeLedger

**Concept**: A **financial snapshot** of a student’s fee obligations for a specific academic year.

This is the **most important financial model**.

**Key Characteristics**:

* One ledger per student per academic year
* Immutable after payments

**Important Fields**:

* `id`
* `studentId`
* `classId`
* `academicYear`
* `baseComponents` – Snapshot of FeeComponents
* `createdAt`

**Invariant**:

* Base components never change after payment exists

---

### 4.4 Payment

**Concept**: A monetary transaction made by a student.

**Key Characteristics**:

* Append-only
* Linked to a ledger

**Important Fields**:

* `id`
* `ledgerId`
* `studentId`
* `amount`
* `mode` – CASH / UPI / BANK / CARD / CHEQUE
* `reference`
* `collectedBy`
* `createdAt`

**Invariant**:

* Payment amounts are always positive

---

### 4.5 LedgerAdjustment

**Concept**: Explicit modification to a ledger total.

**Types**:

* DISCOUNT
* CONCESSION
* WAIVER
* EXTRA
* LATE_FEE

**Important Fields**:

* `id`
* `ledgerId`
* `type`
* `amount` (signed)
* `reason`
* `approvedBy`
* `createdAt`

**Invariant**:

* Adjustments are never deleted or edited

---

### 4.6 Expense

**Concept**: Represents school expenditure.

**Important Fields**:

* `id`
* `category`
* `amount`
* `recordedAt`

---

## 5. Administrative & System Models

### 5.1 Role

**Concept**: Defines UI-level access roles.

Examples:

* ADMIN
* TEACHER

**Purpose**:

* Controls route access
* Determines layout rendering

Note: This is frontend-only authorization and does not imply security guarantees.

---

### 5.2 SystemLog

**Concept**: Represents an audit-style log entry describing a significant system action.

**Important Fields**:

* `id`
* `action` – Description of the event
* `entityType` – Student / Fee / Ledger / etc.
* `entityId`
* `performedBy`
* `timestamp`

**Use Cases**:

* Administrative traceability
* Debugging state transitions
* Future compliance and reporting

System logs are **append-only** and never edited.

---

### 5.3 Invoice (Optional / Derived)

**Concept**: A formatted, user-facing financial document.

**Characteristics**:

* Derived from Payment and Ledger data
* Not a primary data source
* Can be regenerated at any time

Invoices do not participate in business logic.

---

## 6. Relationships Overview

* Student → Class → Section
* Student → StudentFeeLedger → Payments / Adjustments
* FeeStructure → StudentFeeLedger (snapshot)

No circular ownership exists.

---

## 7. Backend Readiness

Each model directly maps to a backend entity or table.

No frontend-only hacks exist in the data model layer.

---

## 8. Conclusion

These domain models form the **semantic backbone** of the system.

All future backend APIs, database schemas, and business rules must align with this specification.

Any change to these models is considered a **breaking architectural change** and must be reviewed carefully.
