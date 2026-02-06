# Routing and Navigation Architecture

## Smart Kids Academy – Frontend Navigation Specification

---

## 1. Purpose of This Document

This document defines the **routing structure, navigation flow, and layout usage** of the frontend application.

Its goals are:

* To make page flow understandable without running the app
* To document role-based access boundaries
* To map routes to domain contexts

This document complements:

* `frontend-architecture.md`
* `domain-models.md`
* Individual context documents

---

## 2. Routing Philosophy

The application follows a **layout-first routing model**:

* Routes are grouped by **user role** and **functional domain**
* Layouts are responsible for navigation chrome
* Pages focus purely on business logic and UI

Routing decisions are **explicit**, not inferred.

---

## 3. Application Bootstrapping & Layout Hierarchy

### 3.1 Entry Point: main.tsx

`main.tsx` is responsible for **initializing the application runtime**.

Responsibilities:

* Creating the React root
* Mounting the router
* Mounting all global context providers

All domain providers (Student, Teacher, Fees, AcademicYear, etc.) are mounted **above the routing layer**, ensuring:

* State persistence across route changes
* No remounting of domain state on navigation

This design guarantees that navigation does not reset application state.

---

### 3.2 Application Root: App.tsx

`App.tsx` defines the **entire routing graph** of the application.

Responsibilities:

* Declaring public vs protected routes
* Attaching layouts to route groups
* Applying authentication guards

`App.tsx` acts as the single source of truth for navigation.

---

### 3.3 Layout Hierarchy

Layouts are structural components that wrap groups of routes.

---

### 3.2 Role-Based Layouts

#### Admin Layout

**Component**: `RoleLayout`

Used for:

* Administrative workflows
* Financial management
* Academic configuration

Includes:

* Full navigation menu
* Access to all modules

#### Teacher Layout

**Component**: `TeacherLayout`

Used for:

* Teacher-facing dashboards
* Limited academic views

Includes:

* Restricted navigation
* Read-only or scoped access

---

## 4. Authentication Gate

### RequireAuth

All protected routes are wrapped by `RequireAuth`.

Responsibilities:

* Prevent unauthenticated access
* Enforce role-based route eligibility

This is a **UI-level guard**, not a security boundary.

---

## 5. Route Map (By Module)

### 5.1 Authentication

| Route    | Description | Layout | Role   |
| -------- | ----------- | ------ | ------ |
| `/login` | Login page  | None   | Public |

---

### 5.2 Dashboard

| Route                | Description       | Layout        | Role    |
| -------------------- | ----------------- | ------------- | ------- |
| `/dashboard`         | Admin dashboard   | RoleLayout    | Admin   |
| `/teacher/dashboard` | Teacher dashboard | TeacherLayout | Teacher |

Contexts used:

* AcademicYearContext
* FeeLedgerContext

---

### 5.3 Students Module

| Route                     | Description     | Layout     | Role  |
| ------------------------- | --------------- | ---------- | ----- |
| `/students`               | Student list    | RoleLayout | Admin |
| `/students/new`           | Admission form  | RoleLayout | Admin |
| `/students/:id`           | Student details | RoleLayout | Admin |
| `/students/:id/statement` | Fee statement   | RoleLayout | Admin |

Contexts used:

* StudentContext
* ClassContext
* SectionContext
* FeeLedgerContext
* AcademicYearContext

---

### 5.4 Teachers Module

| Route           | Description          | Layout     | Role  |
| --------------- | -------------------- | ---------- | ----- |
| `/teachers`     | Teacher list         | RoleLayout | Admin |
| `/teachers/new` | Teacher registration | RoleLayout | Admin |
| `/teachers/:id` | Teacher details      | RoleLayout | Admin |

Contexts used:

* TeacherContext

---

### 5.5 Classes & Sections

| Route              | Description    | Layout     | Role  |
| ------------------ | -------------- | ---------- | ----- |
| `/classes`         | Class list     | RoleLayout | Admin |
| `/classes/promote` | Bulk promotion | RoleLayout | Admin |

Contexts used:

* ClassContext
* SectionContext

---

### 5.6 Fees & Finance

| Route               | Description         | Layout     | Role  |
| ------------------- | ------------------- | ---------- | ----- |
| `/fees/structure`   | Fee structure setup | RoleLayout | Admin |
| `/fees/pending`     | Pending fees        | RoleLayout | Admin |
| `/fees/receipt/:id` | Payment receipt     | RoleLayout | Admin |

Contexts used:

* FeeStructureContext
* FeeLedgerContext

---

### 5.7 Expenses

| Route       | Description      | Layout     | Role  |
| ----------- | ---------------- | ---------- | ----- |
| `/expenses` | Expense tracking | RoleLayout | Admin |

Contexts used:

* FeeLedgerContext

---

### 5.8 Reports

| Route               | Description      | Layout     | Role  |
| ------------------- | ---------------- | ---------- | ----- |
| `/reports`          | Reports home     | RoleLayout | Admin |
| `/reports/income`   | Income reports   | RoleLayout | Admin |
| `/reports/expenses` | Expense reports  | RoleLayout | Admin |
| `/reports/combined` | Combined reports | RoleLayout | Admin |

Contexts used:

* FeeLedgerContext
* AcademicYearContext

---

## 6. Navigation Behavior

### 6.1 Sidebar Navigation

* Rendered by layout components
* Items shown based on role
* Active route highlighting

---

### 6.2 Programmatic Navigation

Used for:

* Form submission redirects
* Workflow completion
* Guarded transitions

Handled via `useNavigate`.

---

## 7. Route-to-Domain Mapping Summary

| Domain        | Routes                 |
| ------------- | ---------------------- |
| Student       | /students/*            |
| Teacher       | /teachers/*            |
| Academic Year | Global                 |
| Fee Ledger    | /fees/*, /students/:id |
| Reports       | /reports/*             |

---

## 8. Error & Fallback Routes

* Invalid routes redirect to dashboard
* Unauthorized routes are blocked by RequireAuth

Future backend errors will surface as route-level error states.

---

## 9. Backend Readiness

Each route corresponds to:

* One or more domain contexts
* A clear backend API boundary

Routing will remain unchanged after backend integration.

---

## 9. Route Tree Overview (Textual)

The following is a **text-based route tree** derived from `App.tsx`, showing the structural hierarchy of routes, guards, and layouts.

```
/
├── /login
│   └── Public route (no layout)
│
├── / (Protected by RequireAuth)
│   └── LayoutShell
│       ├── Admin Routes (RoleLayout)
│       │   ├── /dashboard
│       │   ├── /students
│       │   │   ├── /students/new
│       │   │   ├── /students/:id
│       │   │   └── /students/:id/statement
│       │   ├── /teachers
│       │   │   ├── /teachers/new
│       │   │   └── /teachers/:id
│       │   ├── /classes
│       │   │   └── /classes/promote
│       │   ├── /fees
│       │   │   ├── /fees/structure
│       │   │   ├── /fees/pending
│       │   │   └── /fees/receipt/:id
│       │   ├── /expenses
│       │   └── /reports
│       │       ├── /reports/income
│       │       ├── /reports/expenses
│       │       └── /reports/combined
│       │
│       └── Teacher Routes (TeacherLayout)
│           └── /teacher/dashboard
│
└── *
    └── Redirect / fallback to dashboard
```

This diagram highlights:

* Clear separation between public and protected routes
* Layout-based grouping of role-specific navigation
* Feature-based nesting under a stable layout shell

---

## 10. Conclusion

The routing and navigation system is designed to:

* Be predictable
* Enforce role boundaries
* Scale as modules grow

Navigation is treated as **architecture**, not decoration.
