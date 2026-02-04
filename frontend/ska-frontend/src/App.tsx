import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { StudentProvider } from "./context/StudentContext";
import { TeacherProvider } from "./context/TeacherContext";
import { SectionProvider } from "./context/SectionContext";
import { ClassProvider } from "./context/ClassContext";
import { FeeStructureProvider } from "./context/FeeStructureContext";
import { FeeLedgerProvider } from "./context/FeeLedgerContext";

/* Layouts */
import AdminLayout from "./components/LayoutShell/Layout";
import TeacherLayout from "./components/LayoutShell/TeacherLayout";

/* Dashboards */
import DashboardRouter from "./pages/Dashboard/DashboardRouter";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import TeacherDashboard from "./pages/Dashboard/TeacherDashboard";

/* Pages */
import Students from "./pages/Students/Students";
import StudentDetails from "./pages/Students/StudentDetails";
import Teachers from "./pages/Teachers/Teachers";
import TeacherDetails from "./pages/Teachers/TeacherDetails";
import AdmissionForm from "./pages/Students/AdmissionForm";
import AdmissionPrint from "./pages/Students/AdmissionPrint";

import Classes from "./pages/Class/Classes";
import FeeStructures from "./pages/Fees/FeeStructure";
import Expenses from "./pages/Expenses/Expenses";
import ReportsPage from "./pages/Reports/ReportsPage";
import AcademicYearAdmin from "./pages/Admin/AcademicYear";
import BulkPromotion from "./pages/Class/BulkPromotion";
import FeeStatement from "./pages/Fees/FeeStatement";
import PaymentReceipt from "./pages/Fees/PaymentReceipt";
import PendingFees from "./pages/Fees/PendingFees";
import TeachersForm from "./pages/Teachers/TeacherForm"



function App() {
  return (
    <AuthProvider>
      <FeeLedgerProvider>
        <FeeStructureProvider>
          <ClassProvider>
            <SectionProvider>
              <TeacherProvider>
                <StudentProvider>
                  <BrowserRouter>
                    <Routes>

                      {/* ===== Shared / Utility ===== */}
                      <Route path="/dashboard" element={<DashboardRouter />} />
                      <Route path="/admission/print" element={<AdmissionPrint />} />

                      {/* ===== ADMIN AREA ===== */}
                      <Route element={<AdminLayout />}>
                        <Route path="/dashboard/admin" element={<AdminDashboard />} />
                        <Route path="/students" element={<Students />} />
                        <Route path="/students/:id" element={<StudentDetails />} />
                        <Route path="/teachers" element={<Teachers />} />
                        <Route path="/teachers/:id" element={<TeacherDetails />} />
                        <Route path="/admissionForm" element={<AdmissionForm />} />
                        <Route path="/teachersForm" element={<TeachersForm />} />
                        <Route path="/allclasses" element={<Classes />} />
                        <Route path="/feestructure" element={<FeeStructures />} />
                        <Route path="/expenses" element={<Expenses />} />
                        <Route path="/reports/*" element={<ReportsPage />} />
                        <Route path="/admin/academic-year" element={<AcademicYearAdmin />} />
                        <Route path="/bulkpromotion" element={<BulkPromotion />} />
                        <Route path="/students/:id/statement" element={<FeeStatement />} />
                        <Route path="/receipts/:paymentId" element={<PaymentReceipt />} />
                        <Route path="/dashboard/admin/pending-fees" element={<PendingFees />} />
                        <Route path="/students/admission/print" element={<AdmissionPrint />} />
                      </Route>

                      {/* ===== TEACHER AREA ===== */}
                      <Route element={<TeacherLayout />}>
                        <Route path="/dashboard/teacher" element={<TeacherDashboard />} />
                        <Route path="/students" element={<Students />} />
                        <Route path="/students/:id" element={<StudentDetails />} />
                        <Route path="/allclasses" element={<Classes />} />
                        <Route path="/students/admission/print" element={<AdmissionPrint />} />
                        <Route path="/students/:id/statement" element={<FeeStatement />} />
                        <Route path="/receipts/:paymentId" element={<PaymentReceipt />} />

                      </Route>

                    </Routes>
                  </BrowserRouter>
                </StudentProvider>
              </TeacherProvider>
            </SectionProvider>
          </ClassProvider>
        </FeeStructureProvider>
      </FeeLedgerProvider>
    </AuthProvider>
  );
}

export default App;
