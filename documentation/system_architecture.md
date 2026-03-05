# System Architecture

## Frontend

Technology:

• React
• TypeScript
• Vite

State Management:

• React Context API
• Domain-based contexts

Examples:

StudentContext  
TeacherContext  
ClassContext  
SectionContext  
FeeStructureContext  
FeeLedgerContext  
AcademicYearContext  

Persistence during frontend phase:

• LocalStorage via usePersistentState hook

The frontend is structured to mirror future backend services.

---

## Backend (Planned)

Hybrid database architecture:

### MongoDB – Identity & Academic Data

Stores:

• Students
• Teachers
• Classes
• Sections

Characteristics:

• Highly mutable
• Document-oriented
• Non-financial data only

---

### PostgreSQL – Finance & Audit System

Stores:

• Academic sessions
• Student fee ledgers
• Payments
• Ledger adjustments
• Expenses

Characteristics:

• Transactional
• Append-only financial history
• Strong invariants

---

## Backend Tech Stack

Recommended stack:

• Node.js
• Express or Fastify
• MongoDB + Mongoose
• PostgreSQL
• pg / Prisma / TypeORM

Authentication:

• JWT-based authentication