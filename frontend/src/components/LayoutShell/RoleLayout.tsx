import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AdminLayout from "./Layout";
import TeacherLayout from "./TeacherLayout";

function RoleLayout() {
  const { role } = useAuth();

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (role === "ADMIN") {
    return <AdminLayout />;
  }

  if (role === "TEACHER") {
    return <TeacherLayout />;
  }

  return <Navigate to="/login" replace />;
}

export default RoleLayout;
