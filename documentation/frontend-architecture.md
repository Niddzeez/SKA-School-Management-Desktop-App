# Frontend Architecture Documentation

## Smart Kids Academy – School Management System

---

## 1. Purpose & Scope

This document provides a **complete, implementation-level explanation** of the frontend architecture of the *Smart Kids Academy School Management System*. It is written to allow:

* A new developer to fully understand the system without reading the code first
* A reviewer or evaluator to assess architectural decisions
* A smooth transition to backend integration and deployment

This document strictly covers the **frontend layer**: UI structure, state management, data flow, persistence strategy, and functional modules.

---

## 2. Design Philosophy

The frontend is designed with the following principles:

* **Domain-first architecture**: School entities (Students, Classes, Fees, Academic Years) drive structure
* **Predictable state ownership**: Each domain owns its own state
* **Backend-ready from day one**: Frontend logic mirrors backend service boundaries
* **Zero magic**: Explicit logic over abstraction-heavy frameworks
* **Auditability**: Financial and academic data must be traceable

---

## 3. Technology Stack

### Core

* **React (TypeScript)** – Component-based UI with strict typing
* **Vite** – Development and build tool

### State Management

* **React Context API** – Domain-scoped global state
* **Custom Hooks** – Shared logic and persistence abstraction

### Persistence (Frontend Phase)

* **LocalStorage (via abstraction)** – Simulated persistence layer

### Styling

* Plain CSS, feature-scoped
* Print-specific styles isolated from screen UI

---

## 4. Project Structure Overview

The frontend follows a **feature + domain hybrid structure**.

```
src/
 ├── auth/           # Authentication guards & permission logic
 ├── components/     # Reusable UI & layout components
 ├── context/        # Domain state containers
 ├── hooks/          # Reusable hooks
 ├── mappers/        # Form → domain transformers
 ├── pages/          # Feature-level screens
 ├── styles/         # Page-level CSS
 ├── types/          # Canonical domain models
 ├── utils/          # Cross-cutting utilities
```

Each layer has **strict responsibility boundaries**.

---

## 5. Application Bootstrapping

### Entry Point

* `main.tsx`

  * Creates the React root
  * Wraps the application in all global providers

* `App.tsx`

  * Declares routing structure
  * Mounts layout shells

All domain contexts are mounted **above routing**, ensuring consistent state across navigation.

---

## 6. Routing & Layout Architecture

### Layout Strategy

Layouts are treated as **structural components**, not pages.

Located in:

```
components/LayoutShell/
```

Key layouts:

* `LayoutShell` – Base shell
* `RoleLayout` – Role-aware navigation
* `TeacherLayout` – Teacher-specific UI

### Why This Matters

* Pages remain logic-focused
* Role-based UI changes do not affect business logic
* Navigation is centralized

---

## 7. Authentication & Authorization (Frontend Phase)

### RequireAuth

Located in:

```
auth/RequireAuth.tsx
```

Responsibilities:

* Route protection
* Role-based access gating

### Permissions

* Defined declaratively in `permissions.ts`
* Pages declare required permissions

> Note: This is UI-level authorization. Backend enforcement will replace this.

---

## 8. State Management Architecture

### Philosophy

Each **real-world domain** has:

* Its own context
* Its own mutation functions
* Its own selectors

No context directly mutates another context.

---

## 9. Persistent State Abstraction

### usePersistentState

Located in:

```
hooks/UsePersistentState.ts
```

Responsibilities:

* Initialize state from LocalStorage
* Persist state on every update
* Provide React-like API: `[state, setState]`

This hook acts as a **temporary database adapter**.

Replacing it with API calls will not affect UI logic.

---

## 10. Domain Contexts (Detailed)

### 10.1 AcademicYearContext

**Purpose**: Central authority for academic year consistency.

State:

* `academicYear`
* `availableYears`
* `closedYears`

Functions:

* `setAcademicYear(year)`
* `closeYear(year)`
* `isYearClosed(year)`

Design Decisions:

* Prevents editing historical data
* Enables read-only UI behavior

---

### 10.2 ClassContext

**Purpose**: Manage school classes.

State:

* `classes: Class[]`

Functions:

* `addClass(newClass)`

Notes:

* Class ordering is numeric
* Promotion logic depends on this ordering

---

### 10.3 SectionContext

**Purpose**: Manage sections within classes.

State:

* `sections: Section[]`

Functions:

* `addSection(section)`
* `assignClassTeacher(sectionId, teacherId)`

---

### 10.4 StudentContext

**Purpose**: Student lifecycle management.

State:

* `students: Student[]`

Functions:

* `addStudent(student)`
* `UpdateStudentStatus(id, status)`
* `assignStudenttoSection(studentId, classId, sectionId)`

Notes:

* Status controls ledger creation eligibility
* Section reassignment clears previous mapping

---

### 10.5 TeacherContext

**Purpose**: Teacher records and employment state.

State:

* `teachers: Teacher[]`

Functions:

* `addTeacher(teacher)`
* `updateTeacherStatus(id, status)`

---

### 10.6 FeeStructureContext

**Purpose**: Define fee blueprints per class/year.

State:

* `feeStructures: FeeStructure[]`

Functions:

* `createFeeStructure(classId, academicYear)`
* `addFeeComponent(feeStructureId, component)`
* `removeFeeComponent(feeStructureId, componentId)`
* `activateFeeStructure(feeStructureId)`
* `getActiveFeeStructure(classId, academicYear)`

Rules:

* Only one ACTIVE structure per class/year
* Drafts are mutable; active structures are frozen

---

### 10.7 FeeLedgerContext (Critical Module)

**Purpose**: Financial source of truth.

State:

* `ledgers`
* `payments`
* `adjustments`
* `expenses`

Core Functions:

#### Ledger Creation

* `createLedger(studentId, classId, academicYear, baseComponents)`

#### Ledger Upsert Logic

* `upsertLedgerFromFeeStructure(...)`

  * Creates ledger if none exists
  * Updates ledger only if no payments exist
  * Freezes ledger after first payment

#### Adjustments

* `addAdjustment(adjustment)`

  * Supports discounts, waivers, penalties

#### Payments

* `addPayment(payment)`

  * Validates amount
  * Generates receipt sequence

#### Selectors

* `getLedgerByStudentYear()`
* `getLedgerSummary()`
* `getReceiptsForStudent()`
* `getNetBalance()`

Design Principle:

> Ledger data is append-only. Nothing is silently overwritten.

---

## 11. Pages & Feature Modules

### Students Module

Pages:

* Admission
* Student list
* Student details
* Certificates
* Fee statements

Key Behavior:

* Automatic ledger sync
* Promotion creates next-year ledger

---

### Fees Module

Pages:

* Fee structure setup
* Pending fees
* Receipts
* Statements

---

### Reports Module

Features:

* Time-based income/expense reports
* Academic year filtering
* Combined financial views

Print-safe layouts ensured.

---

## 12. Printing Architecture

Printing is handled via:

* Dedicated print components
* Isolated CSS
* Data selectors (never raw state)

Ensures consistency between screen and printed output.

---

## 13. Error Handling Strategy

* Context-level guards (invalid operations throw errors)
* UI disables invalid actions
* Read-only enforcement for closed years

---

## 14. Known Limitations (Frontend Phase)

* No backend validation
* No concurrency handling
* LocalStorage-based persistence
* UI-only authorization

All limitations are intentional and temporary.

---

## 15. Backend Transition Strategy

Planned replacements:

| Frontend Concept | Backend Equivalent |
| ---------------- | ------------------ |
| Context mutation | API call           |
| PersistentState  | Database           |
| Selectors        | Query endpoints    |

The frontend requires **no structural rewrite** for backend integration.

---

## 16. Conclusion

This frontend is not a mock UI — it is a **fully functional domain simulation** of a school management system.

Its architecture emphasizes correctness, traceability, and future scalability, making it suitable for academic evaluation, real-world deployment, and backend expansion.
