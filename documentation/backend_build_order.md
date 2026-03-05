# Smart Kids Academy – Backend Implementation Order

## Purpose

This document defines the exact order in which backend features should be implemented.

The goal is to ensure that development progresses in a stable and testable way while preserving architectural integrity.

The system should always remain runnable at every stage.

---

# Phase 1 – Core Backend Setup

## Objectives

Establish the backend infrastructure and repository structure.

## Tasks

1. Initialize backend project
2. Configure TypeScript
3. Setup Express or Fastify server
4. Configure environment management
5. Establish project structure

Example directory structure:

backend/
  src/
    auth/
    identity/
    finance/
    shared/
    config/
    app.ts
    server.ts

## Database Connections

Configure two database clients:

MongoDB client  
PostgreSQL client

Both connections should be initialized at server startup.

---

# Phase 2 – Identity Subsystem (MongoDB)

Implement academic identity features first because they unblock most frontend workflows.

## Entities

Students  
Teachers  
Classes  
Sections

## APIs to implement

POST /api/students  
GET /api/students  
GET /api/students/{id}  
PATCH /api/students/{id}/status  
PATCH /api/students/{id}/assignment  

POST /api/teachers  
GET /api/teachers  
PATCH /api/teachers/{id}/status  

POST /api/classes  
GET /api/classes  

POST /api/sections  
GET /api/sections?classId=  

## Rules

• Identity subsystem must not contain financial logic  
• Use status flags instead of deleting records  

---

# Phase 3 – PostgreSQL Financial Schema

Before implementing financial APIs, create the database schema.

## Tables

academic_sessions  
student_fee_ledgers  
ledger_adjustments  
payments  

## Requirements

• Enforce ledger uniqueness constraint  
• Payments must be append-only  
• Ledger adjustments must be append-only  

Create derived view:

ledger_summary

---

# Phase 4 – Financial Read APIs

Implement safe read operations first.

## APIs

GET /api/academic-years  
GET /api/ledgers?studentId=&year=  
GET /api/ledgers/{id}/summary  
GET /api/students/{id}/receipts  

These endpoints allow verification that the database schema and queries behave correctly.

---

# Phase 5 – Financial Command APIs

Now implement mutation endpoints.

## APIs

POST /api/ledgers  
POST /api/ledgers/{id}/payments  
POST /api/ledgers/{id}/adjustments  

## Rules

All financial commands must run inside database transactions.

Invalid operations must return appropriate errors.

---

# Phase 6 – Fee Structure Service

Implement fee blueprint management.

## APIs

POST /api/fee-structures  
POST /api/fee-structures/{id}/components  
DELETE /api/fee-structures/{id}/components/{componentId}  
POST /api/fee-structures/{id}/activate  
GET /api/fee-structures/active  

## Rules

• Only one active structure per class per academic year  
• Active structures cannot be modified  

---

# Phase 7 – Reporting Service

Implement reporting endpoints.

## APIs

GET /api/reports/income  
GET /api/reports/expenses  
GET /api/reports/combined  

Reports should use database queries or views rather than stored summaries.

---

# Phase 8 – Authentication and Authorization

Add security once core functionality is stable.

## Tasks

Implement login endpoint  
Issue JWT tokens  
Add role claims  

Roles include:

ADMIN  
TEACHER

Implement authorization middleware.

---

# Phase 9 – System Logging

Add audit logging capability.

## APIs

GET /api/system-logs  
POST /api/system-logs  

Log important system actions such as:

student admission  
ledger creation  
payment recording  
fee structure activation

---

# Phase 10 – Frontend Integration

Replace LocalStorage persistence gradually.

Integration order:

1. StudentContext → Identity APIs  
2. AcademicYearContext → Finance APIs  
3. FeeLedgerContext → Finance APIs  

The frontend architecture should not require structural changes.

---

# Completion Criteria

The backend implementation is considered complete when:

• All APIs are implemented  
• Database constraints enforce financial invariants  
• Frontend no longer relies on LocalStorage  
• Financial operations are transaction-safe  

At this stage the system becomes production-ready.