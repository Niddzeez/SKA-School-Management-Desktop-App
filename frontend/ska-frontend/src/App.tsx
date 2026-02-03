import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Students from "./pages/Students/Students";
import StudentDetails from "./pages/Students/StudentDetails";
import AdmissionForm from "./pages/Students/AdmissionForm";
import { StudentProvider } from "./context/StudentContext";
import { TeacherProvider } from "./context/TeacherContext";
import TeachersForm from "./pages/Teachers/TeacherForm";
import TeacherDetails from "./pages/Teachers/TeacherDetails";
import Teachers from "./pages/Teachers/Teachers";
import { SectionProvider } from "./context/SectionContext";
import { ClassProvider } from "./context/ClassContext";
import Classes from "./pages/Class/Classes";
import { FeeStructureProvider } from "./context/FeeStructureContext";
import FeeStructures from "./pages/Fees/FeeStructure";
import { FeeLedgerProvider } from "./context/FeeLedgerContext";
import BulkPromotion from "./pages/Class/BulkPromotion";
import OutstandingDues from "./pages/Fees/OutstandingDues";
import FeeStatement from "./pages/Fees/FeeStatement";
import PaymentReceipt from "./pages/Fees/PaymentReceipt";
import Expenses from "./pages/Expenses/Expenses";
import ReportsPage from "./pages/Reports/ReportsPage";
import PendingFees from "./pages/Fees/PendingFees";
import AdmissionPrint from "./pages/Students/AdmissionPrint";
import BonafideCertificate from "./pages/Students/BonafideCertificate";

function App() {
  return (
    <FeeLedgerProvider>
      <FeeStructureProvider>
        <ClassProvider>
          <SectionProvider>
            <TeacherProvider>
              <StudentProvider>
                <BrowserRouter>
                  <Routes>
                    <Route path="/admission/print" element={<AdmissionPrint />} />
                  </Routes>
                  <Routes>

                    <Route element={<Layout />}>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/students" element={<Students />} />
                      <Route path="/teachers" element={<Teachers />} />
                      <Route path="/students/:id" element={<StudentDetails />} />
                      <Route path="/teachers/:id" element={<TeacherDetails />} />
                      <Route path="/admissionForm" element={<AdmissionForm />} />
                      <Route path="/teachersForm" element={<TeachersForm />} />
                      <Route path="/allclasses" element={<Classes />} />
                      <Route path="/feestructure" element={<FeeStructures />} />
                      <Route path="/bulkpromotion" element={<BulkPromotion />} />
                      <Route path="/outstandingdues" element={<OutstandingDues />} />
                      <Route path="/students/:id/statement" element={<FeeStatement />} />
                      <Route path="/receipts/:paymentId" element={<PaymentReceipt />} />
                      <Route path="/expenses" element={<Expenses />} />
                      <Route path="/reports/*" element={<ReportsPage />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/dashboard/pending-fees" element={<PendingFees />} />
                      <Route path="/admin/bulk-promotion" element={<BulkPromotion />} />
                      <Route path="/students/admission/print" element={<AdmissionPrint />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </StudentProvider>
            </TeacherProvider>
          </SectionProvider>
        </ClassProvider>
      </FeeStructureProvider>
    </FeeLedgerProvider>
  );
}

export default App;
