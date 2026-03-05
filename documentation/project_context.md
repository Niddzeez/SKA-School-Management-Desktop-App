# Smart Kids Academy – Project Context

## Overview

This project is a production-grade School Management System designed for Smart Kids Academy. The platform manages both academic administration and financial operations of the school.

The system is being built with a strong emphasis on correctness, auditability, and long-term maintainability.

The application supports workflows including:

• Student admission and lifecycle management  
• Class and section assignment  
• Teacher management  
• Fee structure definition per class and academic year  
• Student fee ledger generation  
• Recording payments and financial adjustments  
• Expense tracking  
• Financial and administrative reports  

The system is designed to prevent data corruption and enforce strict financial correctness.

---

## Architecture Philosophy

The system follows a **domain-first architecture**.

Real-world school entities drive the design:

• Students  
• Teachers  
• Classes  
• Sections  
• Academic Years  
• Fee Structures  
• Student Fee Ledgers  
• Payments  
• Adjustments  

These domain models act as the foundation for:

• frontend state
• backend APIs
• database schemas

---

## Development Stages

Phase 1  
Frontend-only system using React Context and LocalStorage to simulate backend behavior.

Phase 2  
Backend implementation using a hybrid database architecture.

Phase 3  
Replacing LocalStorage with backend APIs while keeping the frontend structure unchanged.

---

## Core Objective

The goal is to build a **reliable administrative system for a real school** where financial data is safe, auditable, and historically consistent.