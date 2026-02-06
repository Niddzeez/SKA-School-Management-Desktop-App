# FeeStructureContext – Fee Blueprint Management

## 1. Responsibility

FeeStructureContext defines **what fees should exist**, not who has paid them.

It acts as a blueprint generator for ledgers.

---

## 2. Owned State

* `feeStructures: FeeStructure[]`

---

## 3. Core Functions

* `createFeeStructure(classId, academicYear)`
* `addFeeComponent(feeStructureId, component)`
* `removeFeeComponent(feeStructureId, componentId)`
* `activateFeeStructure(feeStructureId)`
* `getActiveFeeStructure(classId, academicYear)`

---

## 4. Rules

* Only ONE active structure per class/year
* Draft structures are mutable
* Active structures are immutable

---

## 5. Interaction

* FeeLedgerContext snapshots active structures
* Changes do not affect paid ledgers

---

## 6. Backend Mapping

This maps cleanly to:

* FeeStructure table
* FeeComponent table

Activation logic becomes transactional in backend.
