# AcademicYearContext – Temporal Authority

## 1. Responsibility

AcademicYearContext ensures **temporal consistency** across the system.

It answers one question globally:

> *Which academic year is currently active, and which years are editable?*

---

## 2. Owned State

* `academicYear: string`
* `availableYears: string[]`
* `closedYears: string[]`

---

## 3. Core Functions

* `setAcademicYear(year)` – Switch working year
* `closeYear(year)` – Lock a year permanently
* `isYearClosed(year)` – Read-only guard

---

## 4. Design Decisions

* Closed years are **UI-enforced read-only**
* Historical data remains visible but immutable
* FeeLedger and Reports depend on this context

---

## 5. Backend Mapping

Future backend will:

* Enforce year locking at DB level
* Reject mutations on closed years

This context becomes a thin client-side projection of backend rules.
