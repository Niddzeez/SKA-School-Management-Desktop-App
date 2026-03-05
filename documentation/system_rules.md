# System Rules and Invariants

These rules must never be violated.

---

## Financial Invariants

Payments are append-only.

Payments must never be edited or deleted.

Ledger adjustments must never be edited or deleted.

Each student has exactly one ledger per academic year.

Once a payment exists, base fee components in the ledger cannot change.

Reports must always be derived from ledger data.

No financial totals should be stored redundantly.

---

## Academic Invariants

A student can belong to only one class at a time.

A student can belong to only one section at a time.

Inactive students cannot receive new fee ledgers.

Academic years can be closed and become read-only.

Historical academic data must not be modified.

---

## System Design Rules

Financial data must be stored only in PostgreSQL.

Identity and academic data must be stored only in MongoDB.

Financial services must never query MongoDB directly.

Identity services must never compute financial totals.

All financial mutations must run inside database transactions.

---

## API Design Rules

Avoid generic CRUD endpoints for financial operations.

Prefer explicit command endpoints such as:

POST /ledgers  
POST /ledgers/{id}/payments  
POST /ledgers/{id}/adjustments  

Financial history must always remain immutable.

---

## Reporting Rules

Reports must be generated from derived queries or views.

Reports must never mutate system state.