import Students from "./pages/Students";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import StudentDetails from "./pages/StudentDetails";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/students/:id" element={<StudentDetails />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;