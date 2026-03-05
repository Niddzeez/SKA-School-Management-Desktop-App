# Smart Kids Academy – System Data Flow

## Purpose

This document describes how user actions propagate through the system.

It explains how:

User actions  
→ Frontend pages  
→ Context state mutations  
→ Backend APIs  
→ Database operations  

combine to produce safe and predictable system behavior.

The goal is to ensure the system remains **auditable, deterministic, and safe for financial data.**

---

# Global Flow Pattern

All operations follow a consistent flow pattern.

User Action  
→ UI Validation  
→ Domain Context Function  
→ Backend API Command  
→ Database Transaction  
→ Derived Queries  
→ UI Update

This pattern ensures:

• UI never mutates state directly  
• Domain contexts own mutations  
• Backend enforces invariants  
• Database maintains consistency  

---

# Student Admission Flow

## Trigger

Admin submits the student admission form.

## Flow

1. Admin fills admission form
2. Form performs UI validation
3. Form data mapped to Student domain model
4. StudentContext.addStudent() invoked
5. Backend API call:

POST /api/students

6. MongoDB inserts new student record
7. Frontend updates student list

## Notes

Admission does not automatically create a fee ledger.

Financial records remain separate from academic identity.

---

# Class and Section Assignment

## Trigger

Admin assigns a student to a class and section.

## Flow

1. Admin selects class and section
2. UI validates selection
3. StudentContext.assignStudentToSection()

Backend call:

PATCH /api/students/{id}/assignment

4. MongoDB updates student record
5. UI re-renders updated student placement

## Invariants

• Student can belong to only one class  
• Student can belong to only one section  

---

# Fee Structure Creation

## Trigger

Admin creates a fee structure for a class and academic year.

## Flow

1. Admin creates draft structure
2. Admin adds fee components
3. Components stored temporarily in frontend
4. Structure saved via backend:

POST /api/fee-structures

5. PostgreSQL stores blueprint

When activated:

POST /api/fee-structures/{id}/activate

Only one structure per class/year becomes ACTIVE.

## Invariants

• Only one active structure per class/year  
• Active structures cannot be modified  

---

# Fee Ledger Creation

## Trigger

A student becomes eligible for financial processing.

Conditions:

• Student is ACTIVE  
• Student has class assignment  
• Active fee structure exists  

## Flow

1. Frontend detects ledger requirement
2. FeeLedgerContext.upsertLedgerFromFeeStructure()

Backend call:

POST /api/ledgers

3. PostgreSQL creates ledger

Ledger stores:

student_id  
class_id  
academic_year  
base_components (JSON snapshot)

## Invariants

• One ledger per student per academic year  
• Ledger represents fee structure snapshot  

---

# Payment Recording

## Trigger

Admin records a payment.

## Flow

1. Admin enters payment details
2. UI validates amount and mode
3. FeeLedgerContext.addPayment()

Backend call:

POST /api/ledgers/{id}/payments

4. PostgreSQL inserts payment record

5. Ledger summary view recalculates totals

## Invariants

• Payment amount must be positive  
• Payments cannot exceed pending balance  
• Payments are append-only  

---

# Ledger Adjustments

## Trigger

Admin applies discount, waiver, or penalty.

## Flow

1. Admin selects adjustment type
2. Reason and approver entered
3. FeeLedgerContext.addAdjustment()

Backend call:

POST /api/ledgers/{id}/adjustments

4. PostgreSQL inserts adjustment record

5. Ledger summary recalculates totals

## Adjustment Types

DISCOUNT  
CONCESSION  
WAIVER  
EXTRA  
LATE_FEE

## Invariants

Adjustments cannot be edited or deleted.

---

# Academic Year Switching

## Trigger

Admin selects different academic year.

## Flow

1. AcademicYearContext.setAcademicYear()

2. UI re-evaluates:

• ledgers
• reports
• pending balances

3. Backend queries filtered by academic year

## Special Case: Year Closure

Admin closes academic year.

Backend call:

POST /api/academic-years/{id}/close

Closed years become read-only.

---

# Student Promotion

## Trigger

Admin promotes students to next class.

## Flow

1. System determines next class based on ordering
2. Student assignment updated
3. Academic year updated
4. Ledger initialized for new year if fee structure exists

## Guarantee

Promotion does not modify historical ledgers.

---

# Reports and Printing

## Trigger

Admin generates report.

## Flow

1. User selects filters
2. Backend queries derived views
3. Data aggregated server-side
4. Print-safe layout generated

Reports include:

• Income reports  
• Expense reports  
• Combined financial reports  

Reports never modify system state.

---

# Error Prevention

Errors are prevented through:

UI validation  
Context-level guards  
Backend invariant checks  
Database constraints  

Illegal operations are rejected before data mutation occurs.

---

# Summary

The system is designed so that:

• Academic identity data flows through MongoDB  
• Financial data flows through PostgreSQL  
• Domain contexts coordinate frontend logic  
• Backend APIs enforce invariants  
• Database constraints protect financial correctness

This layered flow ensures the system remains:

predictable  
auditable  
financially safe