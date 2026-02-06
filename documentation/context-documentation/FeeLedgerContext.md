# FeeLedgerContext – Financial Subsystem Documentation

## 1. Responsibility

FeeLedgerContext is the **financial source of truth** for the entire system. It models how money is *defined*, *modified*, *paid*, and *reported*.

It deliberately mirrors real-world accounting constraints:

* Fees are snapshotted
* Payments are append-only
* Adjustments are explicit
* History is never silently rewritten

---

## 2. Owned State

* `ledgers: StudentFeeLedger[]`
* `payments: Payment[]`
* `adjustments: LedgerAdjustment[]`
* `expenses: Expense[]`

Each array represents a conceptual database table.

---

## 3. Ledger Lifecycle

### Creation

`createLedger(studentId, classId, academicYear, baseComponents)`

Creates a fee ledger snapshot for a student in a given academic year.

Rules:

* One ledger per student per academic year
* Duplicate creation is disallowed

---

### Upsert Logic (Critical)

`upsertLedgerFromFeeStructure(...)`

This function enforces **financial immutability**.

Cases:

1. No ledger → create
2. Ledger exists, no payments → update base components
3. Ledger exists, payments exist → freeze

This prevents retroactive fee manipulation.

---

## 4. Adjustments

`addAdjustment(adjustment)`

Supported types:

* DISCOUNT
* CONCESSION
* WAIVER
* EXTRA
* LATE_FEE

All adjustments:

* Are signed (+ / -)
* Require reason and approval
* Are stored permanently

---

## 5. Payments

`addPayment(payment)`

Rules:

* Amount must be positive
* Linked to ledger
* Timestamped

Receipt numbers are generated sequentially per academic year.

---

## 6. Selectors (Read Models)

* `getLedgerByStudentYear`
* `getLedgerSummary`
* `getReceiptsForStudent`
* `getNetBalance`

Selectors act like SQL views.

---

## 7. Design Guarantees

* No hidden mutations
* Append-only financial history
* Deterministic summaries

---

## 8. Backend Mapping

| Frontend   | Backend             |
| ---------- | ------------------- |
| Ledger     | Ledger table        |
| Payment    | Payment transaction |
| Adjustment | Audit entry         |

This context can be converted to backend services with no redesign.
