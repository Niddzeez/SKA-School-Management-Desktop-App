# StudentContext – Student Lifecycle Management

## 1. Responsibility

StudentContext models the **academic and administrative lifecycle** of a student.

It does not manage fees directly, but triggers fee logic indirectly.

---

## 2. Owned State

* `students: Student[]`

---

## 3. Core Functions

* `addStudent(student)` – Admission
* `UpdateStudentStatus(id, status)` – Active / Inactive
* `assignStudenttoSection(studentId, classId, sectionId)` – Academic placement

---

## 4. Design Rules

* Only ACTIVE students can have ledgers
* Section reassignment overwrites previous mapping
* Promotion logic lives in pages, not context

---

## 5. Interactions

Triggers:

* Fee ledger creation via FeeLedgerContext
* Academic progression logic

---

## 6. Backend Mapping

| Frontend      | Backend          |
| ------------- | ---------------- |
| Student       | Student table    |
| Status        | Enrollment state |
| Class/Section | Foreign keys     |

StudentContext becomes a CRUD service wrapper in backend.
