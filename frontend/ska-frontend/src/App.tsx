import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import StudentDetails from "./pages/StudentDetails";
import Reports from "./pages/Reports";
import AdmissionForm from "./pages/AdmissionForm";
import { StudentProvider } from "./context/StudentContext";
import { TeacherProvider } from "./context/TeacherContext";
import TeachersForm from "./pages/TeacherForm";
import TeacherDetails from "./pages/TeacherDetails";
import Teachers from "./pages/Teachers";
import { SectionProvider } from "./context/SectionContext";
import { ClassProvider } from "./context/ClassContext";
import Classes from "./pages/Classes";
import { FeeStructureProvider } from "./context/FeeStructureContext";
import FeeStructures from "./pages/FeeStructure";

function App() {
  return (
    <FeeStructureProvider>
      <ClassProvider>
        <SectionProvider>
          <TeacherProvider>
            <StudentProvider>
              <BrowserRouter>
                <Routes>
                  <Route element={<Layout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/students" element={<Students />} />
                    <Route path="/teachers" element={<Teachers />} />
                    <Route path="/students/:id" element={<StudentDetails />} />
                    <Route path="/teachers/:id" element={<TeacherDetails />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/admissionForm" element={<AdmissionForm />} />
                    <Route path="/teachersForm" element={<TeachersForm />} />
                    <Route path="/allclasses" element={<Classes />} />
                    <Route path="/feestructure" element={<FeeStructures/>} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </StudentProvider>
          </TeacherProvider>
        </SectionProvider>
      </ClassProvider>
    </FeeStructureProvider>
  );
}

export default App;
