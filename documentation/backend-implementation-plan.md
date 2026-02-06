# Backend Implementation Plan

## Smart Kids Academy – Execution Roadmap

---

## 1. Purpose of This Document

This document describes **exactly how the backend will be implemented**, step by step, based on the already-finalized:

* Frontend architecture
* Domain models
* Data flows
* Invariants
* Backend API derivation
* PostgreSQL financial schema

At this stage, **no new design decisions are required**. This is an execution plan.

---

## 2. High-Level Architecture

The backend is split conceptually into two subsystems:

### 2.1 Identity & Academic Subsystem (MongoDB)

Responsible for:

* Students
* Teachers
* Classes
* Sections
* Non-financial academic state

Characteristics:

* Highly mutable
* Document-oriented
* No financial logic

---

### 2.2 Finance & Audit Subsystem (PostgreSQL)

Responsible for:

* Academic sessions
* Fee ledgers
* Payments
* Adjustments
* Expenses
* Financial summaries

Characteristics:

* Append-only
* Strong invariants
* Transactional
* Audit-safe

---

## 3. Technology Stack (Recommended)

* **Node.js** with Express or Fastify
* **MongoDB** with Mongoose (identity data)
* **PostgreSQL** with `pg`, Prisma, or TypeORM (finance data)
* JWT-based authentication

The architecture is framework-agnostic; this stack optimizes development speed.

---

## 4. Repository Structure

Initial monorepo structure:

```
backend/
└── src/
    ├── identity/        # MongoDB models & routes
    ├── finance/         # PostgreSQL logic & routes
    ├── auth/            # Authentication & authorization
    ├── shared/          # Errors, utilities, types
    └── app.ts           # Server bootstrap
```

This structure enforces **conceptual separation without premature microservices**.

---

## 5. Phase-by-Phase Implementation Plan

### Phase 1: Identity & Academic APIs (MongoDB)

Implement first to unblock frontend integration.

#### Scope

* Students
* Teachers
* Classes
* Sections

#### APIs

* `POST /api/students`

* `GET /api/students`

* `GET /api/students/:id`

* `PATCH /api/students/:id/status`

* `PATCH /api/students/:id/assignment`

* `POST /api/classes`

* `GET /api/classes`

* `POST /api/sections`

* `GET /api/sections?classId=...`

* `POST /api/teachers`

* `GET /api/teachers`

#### Rules

* No financial logic allowed
* Hard deletes avoided; prefer status flags

---

### Phase 2: Finance Schema Setup (PostgreSQL)

Set up database **exactly as designed**.

#### Tables

* `academic_sessions`
* `student_fee_ledgers`
* `ledger_adjustments`
* `payments`

#### Derived Views

* `ledger_summary`

#### Guarantees

* Append-only payments
* One ledger per student per academic year
* JSONB snapshot for base components

---

### Phase 3: Finance Read APIs (Safe Reads First)

Implement read-only endpoints to validate schema correctness.

#### APIs

* `GET /api/academic-years`
* `GET /api/ledgers?studentId=&year=`
* `GET /api/ledgers/:id/summary`
* `GET /api/students/:id/receipts`

#### Rules

* Reads must rely on views/selectors
* No derived values stored

---

### Phase 4: Finance Command APIs (Transactional)

Implement mutation endpoints **in strict order**.

#### APIs

1. `POST /api/ledgers`
2. `POST /api/ledgers/:id/adjustments`
3. `POST /api/ledgers/:id/payments`

#### Rules

* Each endpoint runs inside a transaction
* Invariant violations fail fast
* No UPDATE or DELETE endpoints exist

---

## 6. Cross-Subsystem Discipline Rules

### Rule 1: Finance Never Queries MongoDB

* `student_id` and `class_id` are treated as opaque strings
* Historical financial data must survive identity changes

---

### Rule 2: Identity Never Computes Money

* Identity subsystem may display balances via finance API
* It must never calculate or persist financial totals

---

## 7. Authentication & Authorization Phase

Implemented **after core APIs are stable**.

### Steps

* Login endpoint
* JWT issuance
* Role claims (`ADMIN`, `TEACHER`)
* Route-level authorization middleware

Frontend `RequireAuth` maps directly to backend enforcement.

---

## 8. Frontend Integration Strategy

Replace `usePersistentState` incrementally.

Order:

1. StudentContext → Identity APIs
2. AcademicYearContext → Finance APIs
3. FeeLedgerContext → Finance APIs

Do not refactor all contexts at once.

---

## 9. Testing Strategy

### Focus Areas

* Ledger uniqueness
* Freeze-on-payment behavior
* Adjustment correctness
* Academic year immutability

### Non-Goals (Initial Phase)

* Performance tuning
* Load testing
* Horizontal scaling

Correctness precedes optimization.

---

## 10. What Must Not Change

* Domain invariants
* Financial immutability rules
* Mongo–Postgres separation
* API semantics

Changing these constitutes a **design regression**.

---

## 11. Completion Criteria

Backend implementation is considered complete when:

* All APIs from `backend-api-derivation.md` exist
* PostgreSQL schema is enforced in production
* Frontend no longer relies on LocalStorage
* Financial invariants are enforced server-side

---

## 12. Conclusion

This plan marks the transition from **system design** to **system construction**.

All major thinking is complete. Remaining work is disciplined execution.

Deviation from this plan should be intentional and documented.
