# Smart Kids Academy – Architecture Decision Record (ADR)

This document records the key architectural decisions made for the system and the reasoning behind them.

The purpose is to ensure that future development does not accidentally break critical design principles.

Each decision includes:

- Context
- Decision
- Consequences

---

# ADR-001: Domain-First Architecture

## Context

School management systems contain multiple real-world entities:

Students, Teachers, Classes, Sections, Academic Years, Fee Structures, Ledgers, Payments.

If the UI structure or database structure drives the design, the system becomes difficult to reason about and easy to corrupt.

## Decision

The system is designed using **domain models as the primary architectural unit**.

Every system layer mirrors these models:

Frontend contexts  
Backend services  
Database schemas

Examples:

Student  
Teacher  
Class  
Section  
FeeStructure  
StudentFeeLedger  
Payment  
LedgerAdjustment

## Consequences

Advantages:

• Clear mapping between real-world operations and code  
• Easier backend derivation  
• Lower risk of hidden coupling  

Tradeoffs:

• Slightly more initial design work

---

# ADR-002: Hybrid Database Architecture

## Context

The system must store two very different types of data:

1. Academic identity data
2. Financial ledger data

Academic data changes frequently and benefits from flexible schema structures.

Financial data must be **transactionally safe and auditable**.

## Decision

Use a **hybrid database architecture**:

MongoDB → identity & academic subsystem  
PostgreSQL → financial subsystem

Identity subsystem stores:

Students  
Teachers  
Classes  
Sections

Finance subsystem stores:

Academic sessions  
Student fee ledgers  
Payments  
Adjustments  
Expenses

## Consequences

Advantages:

• Financial safety using relational constraints
• Flexible academic data model
• Easier financial reporting

Tradeoffs:

• Two database connections
• Slightly more backend complexity

---

# ADR-003: Append-Only Financial History

## Context

Financial records must be auditable and historically accurate.

Allowing edits or deletions of payments introduces:

• audit risks
• reconciliation problems
• accounting inconsistencies

## Decision

All financial events are **append-only**.

Payments cannot be edited or deleted.

Adjustments cannot be edited or deleted.

Any correction must be performed using a **new adjustment record**.

## Consequences

Advantages:

• Complete audit trail
• Safe historical reporting
• Accounting correctness

Tradeoffs:

• Corrections require additional records rather than edits

---

# ADR-004: Ledger Freeze-on-Payment Rule

## Context

Fee structures can change over time.

However, once a student has made a payment, modifying the base fee components would corrupt financial history.

## Decision

Once a ledger has at least one payment:

Base fee components become **immutable**.

The ledger becomes a financial snapshot.

## Consequences

Advantages:

• Historical accuracy
• Prevents retroactive fee manipulation

Tradeoffs:

• Fee corrections must occur through adjustments

---

# ADR-005: Context-Based Frontend State

## Context

The frontend must simulate backend behavior during early development.

Using global state libraries prematurely adds complexity.

## Decision

Use **React Context for domain state management**.

Each domain entity has its own context.

Examples:

StudentContext  
TeacherContext  
ClassContext  
SectionContext  
FeeStructureContext  
FeeLedgerContext  
AcademicYearContext

LocalStorage is used as temporary persistence.

## Consequences

Advantages:

• Clear ownership of state
• Easy backend replacement
• Minimal dependencies

Tradeoffs:

• Some boilerplate code

---

# ADR-006: Explicit Command APIs

## Context

Generic CRUD APIs often allow dangerous operations such as updating financial records.

Financial workflows should be expressed as explicit domain commands.

## Decision

Backend APIs follow **command-based design**.

Examples:

POST /ledgers  
POST /ledgers/{id}/payments  
POST /ledgers/{id}/adjustments  

Instead of generic:

PUT /payments/{id}

## Consequences

Advantages:

• Prevents invalid operations
• Makes financial workflows explicit
• Easier to enforce invariants

Tradeoffs:

• More endpoints than CRUD

---

# ADR-007: Derived Financial Reports

## Context

Financial totals such as pending balances can easily become inconsistent if stored directly.

## Decision

Reports and summaries must always be **derived from base records**.

For example:

ledger_summary view computes totals from:

base components  
adjustments  
payments

No financial totals are stored redundantly.

## Consequences

Advantages:

• Guaranteed consistency
• Eliminates synchronization bugs

Tradeoffs:

• Slightly heavier queries

---

# ADR-008: Immutable Historical Academic Data

## Context

Past academic years represent historical records.

Allowing modifications would corrupt reports and student history.

## Decision

Academic years can be **closed**.

Closed years become read-only.

## Consequences

Advantages:

• Historical correctness
• Safe reporting

Tradeoffs:

• Corrections require explicit procedures