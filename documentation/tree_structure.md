├── README.md
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── public/
│   └── vite.svg
├── src/
│   ├── App.css
│   ├── App.tsx
│   ├── assets/
│   │   ├── logo.png
│   │   ├── logo.svg
│   │   └── react.svg
│   ├── auth/
│   │   ├── RequireAuth.tsx
│   │   └── permissions.ts
│   ├── components/
│   │   ├── Admin/
│   │   ├── ClassCard.tsx
│   │   ├── FormInputBoxes.tsx
│   │   ├── LayoutShell/
│   │   │   ├── Layout.tsx
│   │   │   ├── LayoutShell.tsx
│   │   │   ├── RoleLayout.tsx
│   │   │   └── TeacherLayout.tsx
│   │   ├── print/
│   │   │   ├── PrintHeader.tsx
│   │   │   ├── PrintLayout.tsx
│   │   │   ├── print.css
│   │   │   └── report-print.css
│   │   ├── studentTables.tsx
│   │   └── teacherTables.tsx
│   ├── context/
│   │   ├── AcademicYearContext.tsx
│   │   ├── AuthContext.tsx
│   │   ├── ClassContext.tsx
│   │   ├── FeeLedgerContext.tsx
│   │   ├── FeeStructureContext.tsx
│   │   ├── SectionContext.tsx
│   │   ├── StudentContext.tsx
│   │   ├── SystemLogContext.tsx
│   │   └── TeacherContext.tsx
│   ├── hooks/
│   │   └── UsePersistentState.ts
│   ├── index.css
│   ├── main.tsx
│   ├── mappers/
│   │   ├── formtostudents.ts
│   │   └── formtoteachers.ts
│   ├── pages/
│   │   ├── Admin/
│   │   │   ├── AcademicYear.tsx
│   │   │   ├── AcademicYearTimeline.css
│   │   │   ├── AcademicYearTimeline.tsx
│   │   │   └── Settings.tsx
│   │   ├── Auth/
│   │   │   └── Login.tsx
│   │   ├── Class/
│   │   │   ├── BulkPromotion.css
│   │   │   ├── BulkPromotion.tsx
│   │   │   ├── ClassRegisterModal.tsx
│   │   │   └── Classes.tsx
│   │   ├── Dashboard/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── DashboardKPI.tsx
│   │   │   ├── DashboardRouter.tsx
│   │   │   ├── TeacherDashboard.tsx
│   │   │   └── dashboard.css
│   │   ├── Expenses/
│   │   │   └── Expenses.tsx
│   │   ├── Fees/
│   │   │   ├── ClassFeeSummary.tsx
│   │   │   ├── FeeStatement.tsx
│   │   │   ├── FeeStructure.tsx
│   │   │   ├── OutstandingDues.tsx
│   │   │   ├── PaymentReceipt.tsx
│   │   │   ├── PendingFees.tsx
│   │   │   └── ThermalReciept.tsx
│   │   ├── Reports/
│   │   │   ├── Filters/
│   │   │   │   ├── AcademicYearSelector.tsx
│   │   │   │   ├── ReportTypeSelector.tsx
│   │   │   │   ├── TimeRangeSelector.tsx
│   │   │   │   └── filters.css
│   │   │   ├── Income/
│   │   │   │   ├── DailyIncomeReport.tsx
│   │   │   │   ├── HalfYearlyIncomeReport.tsx
│   │   │   │   ├── MonthlyIncomeReport.tsx
│   │   │   │   ├── YearlyIncomeReport.tsx
│   │   │   │   └── incomeReports.css
│   │   │   ├── ReportsPage.css
│   │   │   ├── ReportsPage.tsx
│   │   │   ├── Statements/
│   │   │   │   ├── YearEndStatement.tsx
│   │   │   │   └── statements.css
│   │   │   ├── Utils/
│   │   │   │   ├── PrintUtils.tsx
│   │   │   │   ├── aggregationUtils.ts
│   │   │   │   ├── printUtils.ts
│   │   │   │   └── reportDateUtils.ts
│   │   │   ├── combined/
│   │   │   │   ├── CombinedReports.css
│   │   │   │   ├── DailyIncomeVsExpenseReport.tsx
│   │   │   │   ├── HalfYearlyIncomeVsExpenseReport.tsx
│   │   │   │   ├── MonthlyIncomevsExpenseReport.tsx
│   │   │   │   └── YearlyIncomeVsExpense.tsx
│   │   │   └── expenses/
│   │   │       ├── DailyExpenseReport.tsx
│   │   │       ├── HalfYearlyExpenseReport.tsx
│   │   │       ├── MonthlyExpenseReport.tsx
│   │   │       ├── YearlyExpenseReport.tsx
│   │   │       └── expenseReports.css
│   │   ├── Students/
│   │   │   ├── AdmissionForm.tsx
│   │   │   ├── AdmissionPrint.tsx
│   │   │   ├── BonafideCertificate.tsx
│   │   │   ├── StudentDetails.tsx
│   │   │   ├── Students.tsx
│   │   │   └── bonafide.css
│   │   └── Teachers/
│   │       ├── TeacherDetails.tsx
│   │       ├── TeacherForm.tsx
│   │       └── Teachers.tsx
│   ├── styles/
│   │   ├── AdmissionForm.css
│   │   ├── ClassFeeSummary.css
│   │   ├── Classes.css
│   │   ├── Expenses.css
│   │   ├── FeeStatement.css
│   │   ├── FormInputBoxes.css
│   │   ├── Layout.css
│   │   ├── OutstandingDues.css
│   │   ├── PendingFees.css
│   │   ├── Students.css
│   │   ├── TeacherForm.css
│   │   ├── Teachers.css
│   │   ├── studentDetails.css
│   │   └── studentTable.css
│   ├── types/
│   │   ├── Class.ts
│   │   ├── ClassFeeStructure.ts
│   │   ├── Expenses.ts
│   │   ├── Invoices.ts
│   │   ├── LedgerAdjustments.ts
│   │   ├── Payments.ts
│   │   ├── Role.ts
│   │   ├── Section.ts
│   │   ├── Student.ts
│   │   ├── StudentFeeLedger.ts
│   │   ├── SystemLog.ts
│   │   └── Teachers.ts
│   ├── utils/
│   │   ├── Backup.ts
│   │   ├── admissionPrint.css
│   │   ├── admissionpdf.tsx
│   │   ├── exportTOCSV.ts
│   │   ├── exportUtils.ts
│   │   ├── seedData.ts
│   │   └── students.ts
│   └── vite-env.d.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
