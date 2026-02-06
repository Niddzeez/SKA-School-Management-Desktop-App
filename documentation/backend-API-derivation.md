# Backend API Derivation

## Smart Kids Academy – Frontend-to-Backend Contract Specification

---

## 1. Purpose of This Document

This document derives a **backend API specification directly from the existing frontend architecture, domain models, contexts, data flows, and invariants**.

It answers one question precisely:

> *If we replace frontend contexts with a backend service, what APIs must exist, and what guarantees must they provide?*

This is not a speculative design. Every endpoint here is justified by:

* A frontend context function
* A documented data flow
* An invariant that must be enforced

---

## 2. API Design Principles

The backend API follows these principles:

* **Context parity**: Each frontend context maps to one backend service area
* **Explicit commands**: Mutations are commands, not generic updates
* **Immutable financial records**: No update/delete for payments or adjustments
* **Temporal safety**: Academic year rules enforced server-side
* **Deterministic reads**: Queries return derived views, not raw joins

---

## 3. Authentication & Authorization (Baseline)

### 3.1 Authentication

* Session or token-based authentication (JWT or equivalent)
* Frontend role context replaced by backend-issued role claims

### 3.2 Authorization

* Role-based access control (ADMIN, TEACHER)
* Backend rejects unauthorized commands regardless of frontend state

---

## 4. Academic Year Service

### Database Mapping (PostgreSQL)

Table: `academic_sessions`

| Column                   | Meaning                            |
| ------------------------ | ---------------------------------- |
| `id`                     | Primary key for academic session   |
| `name`                   | Academic year label (e.g. 2025-26) |
| `start_date`, `end_date` | Temporal bounds                    |

This table is the **single temporal authority** for all financial records.

### Endpoints

* `GET /api/academic-years`

  * Maps to: `SELECT * FROM academic_sessions`

* `POST /api/academic-years/{id}/close`

  * Backend marks year as closed (flag or policy layer)

---

## 5. Student Service

### Endpoints

* `POST /api/students`

  * Creates a new student (admission)

* `GET /api/students`

  * Returns all students

* `GET /api/students/{id}`

  * Returns student details

* `PATCH /api/students/{id}/status`

  * Body: `{ status }`

* `PATCH /api/students/{id}/assignment`

  * Body: `{ classId, sectionId }`

### Guarantees

* Only valid class/section combinations allowed
* Inactive students cannot receive new ledgers

---

## 6. Teacher Service

### Endpoints

* `POST /api/teachers`
* `GET /api/teachers`
* `GET /api/teachers/{id}`
* `PATCH /api/teachers/{id}/status`

---

## 7. Class & Section Service

### Class Endpoints

* `POST /api/classes`
* `GET /api/classes`

### Section Endpoints

* `POST /api/sections`
* `GET /api/sections?classId=...`
* `PATCH /api/sections/{id}/assign-teacher`

---

## 8. Fee Structure Service

### Endpoints

* `POST /api/fee-structures`

  * Creates draft fee structure

* `POST /api/fee-structures/{id}/components`

  * Adds a fee component

* `DELETE /api/fee-structures/{id}/components/{componentId}`

  * Removes component (draft only)

* `POST /api/fee-structures/{id}/activate`

  * Activates structure

* `GET /api/fee-structures/active?classId=...&year=...`

### Guarantees

* Only one active structure per class/year
* Active structures are immutable

---

## 9. Fee Ledger Service (Critical)

### Database Mapping (PostgreSQL)

#### Ledger Table

Table: `student_fee_ledgers`

| Column                | Source                      |
| --------------------- | --------------------------- |
| `id`                  | Ledger UUID                 |
| `student_id`          | MongoDB Student `_id`       |
| `class_id`            | MongoDB Class `_id`         |
| `academic_session_id` | FK → `academic_sessions.id` |
| `base_components`     | JSONB fee snapshot          |
| `created_at`          | Ledger creation timestamp   |

Constraint enforced:

* `UNIQUE(student_id, academic_session_id)` → one ledger per student per year

---

#### Adjustments Table

Table: `ledger_adjustments`

* Linked by `ledger_id`
* `ON DELETE CASCADE`
* Signed amounts enforce discount vs penalty

---

#### Payments Table

Table: `payments`

* Append-only (UPDATE, DELETE revoked)
* `ledger_id` enforced with FK
* Denormalized `student_id` for query efficiency

---

#### Derived Views

View: `ledger_summary`

Backend reads from this view for:

* Ledger status
* Pending amount
* Paid totals

No summary values are stored redundantly.

### API Endpoints

* `POST /api/ledgers`

  * Inserts into `student_fee_ledgers`

* `POST /api/ledgers/{id}/payments`

  * Inserts into `payments`

* `POST /api/ledgers/{id}/adjustments`

  * Inserts into `ledger_adjustments`

* `GET /api/ledgers/{id}/summary`

  * Reads from `ledger_summary`

---

## 10. Reporting Service

### Endpoints

* `GET /api/reports/income`
* `GET /api/reports/expenses`
* `GET /api/reports/combined`

Parameters:

* Academic year
* Time range

Reports are computed server-side and returned as read models.

---

## 11. System Log Service

### Endpoints

* `GET /api/system-logs`
* `POST /api/system-logs`

Logs are append-only and immutable.

---

## 12. Error Handling Strategy

### Error Categories

* `400 Bad Request` – Invalid command
* `403 Forbidden` – Authorization failure
* `409 Conflict` – Invariant violation
* `422 Unprocessable Entity` – Validation failure

Frontend maps these to user-facing messages.

---

## 13. Data Consistency & Transactions

* Ledger creation, payment insertion, and adjustment insertion are transactional
* Fee structure activation is atomic

---

## 14. Migration Strategy

Frontend replacement plan:

| Frontend           | Backend                |
| ------------------ | ---------------------- |
| Context state      | API-backed cache       |
| usePersistentState | API calls              |
| Selectors          | Backend read endpoints |

No frontend UI rewrite required.

---

## 15. Conclusion

This API specification is a **direct consequence** of the existing frontend design.

Backend development can proceed independently and confidently, knowing that:

* Business rules are already defined
* Invariants are explicit
* Frontend and backend semantics are aligned

This document marks the transition from **frontend simulation** to **full system implementation**.
