# Database Migration & Seeding Plan

## Smart Kids Academy – Backend Data Initialization Strategy

---

## 1. Purpose of This Document

This document defines **how databases are created, versioned, and populated with initial data** for the Smart Kids Academy system.

It ensures that:

* Database state is reproducible
* Environments (dev / test / prod) remain consistent
* Financial correctness is never compromised during setup

This plan covers **both MongoDB and PostgreSQL**, respecting their distinct roles.

---

## 2. Guiding Principles

1. **Schema before data** – migrations always run before seeds
2. **Idempotency** – running migrations multiple times is safe
3. **Financial safety** – seeded financial data is minimal and controlled
4. **Environment isolation** – production seeding differs from development

---

## 3. Migration Strategy Overview

| Database   | Tooling Recommendation      | Purpose                  |
| ---------- | --------------------------- | ------------------------ |
| MongoDB    | Application-managed schemas | Identity & academic data |
| PostgreSQL | SQL migrations (versioned)  | Finance & audit data     |

---

## 4. PostgreSQL Migration Plan (Finance Subsystem)

### 4.1 Migration Ordering

Migrations must be applied in the following order:

1. Enable extensions
2. Create reference tables
3. Create core financial tables
4. Create constraints
5. Create derived views

---

### 4.2 Migration Steps

#### Migration 001 – Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

#### Migration 002 – Academic Sessions

```sql
CREATE TABLE academic_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

#### Migration 003 – Student Fee Ledgers

```sql
CREATE TABLE student_fee_ledgers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id TEXT NOT NULL,
  class_id TEXT NOT NULL,
  academic_session_id UUID NOT NULL REFERENCES academic_sessions(id),
  base_components JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (student_id, academic_session_id)
);
```

---

#### Migration 004 – Ledger Adjustments

```sql
CREATE TABLE ledger_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ledger_id UUID NOT NULL REFERENCES student_fee_ledgers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('DISCOUNT','CONCESSION','WAIVER','EXTRA','LATE_FEE')),
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  approved_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

#### Migration 005 – Payments (Append-only)

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ledger_id UUID NOT NULL REFERENCES student_fee_ledgers(id) ON DELETE RESTRICT,
  student_id TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  mode TEXT NOT NULL CHECK (mode IN ('CASH','UPI','BANK','CARD','CHEQUE')),
  reference TEXT,
  collected_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

REVOKE UPDATE, DELETE ON payments FROM PUBLIC;
```

---

#### Migration 006 – Derived Views

```sql
CREATE VIEW ledger_summary AS
SELECT
  l.id AS ledger_id,
  l.student_id,
  l.class_id,
  (
    SELECT COALESCE(SUM((c->>'amount')::INT), 0)
    FROM jsonb_array_elements(l.base_components) c
  ) AS base_total,
  COALESCE((
    SELECT SUM(a.amount)
    FROM ledger_adjustments a
    WHERE a.ledger_id = l.id
  ), 0) AS adjustments_total,
  COALESCE((
    SELECT SUM(p.amount)
    FROM payments p
    WHERE p.ledger_id = l.id
  ), 0) AS paid_total
FROM student_fee_ledgers l;
```

---

## 5. PostgreSQL Seeding Plan

### 5.1 Seed Scope (PostgreSQL)

Seed **only reference data**, never transactional data.

Allowed seeds:

* Academic sessions

Forbidden seeds:

* Payments
* Adjustments
* Ledgers (except controlled demos)

---

### 5.2 Academic Session Seed

```sql
INSERT INTO academic_sessions (name, start_date, end_date)
VALUES ('2025-26', '2025-06-01', '2026-03-31');
```

---

## 6. MongoDB Migration & Seeding Plan (Identity Subsystem)

### 6.1 Schema Management

MongoDB uses application-level schema enforcement:

* Mongoose schemas
* Validation rules

No DB-level migrations required.

---

### 6.2 Seed Scope (MongoDB)

Seed data includes:

* Classes
* Sections
* Teachers
* Optional demo students

---

### 6.3 Recommended Seed Order

1. Classes
2. Sections
3. Teachers
4. Students (optional)

Students seeded for demo purposes must be marked clearly.

---

## 7. Environment-Specific Seeding Rules

| Environment | Seeding Behavior       |
| ----------- | ---------------------- |
| Development | Full demo data         |
| Testing     | Minimal, deterministic |
| Production  | Reference-only         |

---

## 8. Rollback Strategy

### PostgreSQL

* Migrations are versioned
* Rollback scripts exist per migration
* Financial tables are never truncated in production

### MongoDB

* Collections dropped only in dev/test
* No destructive operations in prod

---

## 9. Verification Checklist

After migration and seeding:

* [ ] `academic_sessions` populated
* [ ] All tables exist
* [ ] Constraints active
* [ ] `ledger_summary` view functional
* [ ] No UPDATE/DELETE allowed on `payments`

---

## 10. Conclusion

This migration and seeding plan ensures:

* Reproducible environments
* Financial correctness from day one
* Safe onboarding of backend development

All data initialization follows the system’s invariant-first philosophy.
