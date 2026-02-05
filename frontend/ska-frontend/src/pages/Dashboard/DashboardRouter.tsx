import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function DashboardRouter() {
  const { role } = useAuth();

  if (role === "ADMIN") {
    return <Navigate to="/dashboard/admin" replace />;
  }

  if (role === "TEACHER") {
    return <Navigate to="/dashboard/teacher" replace />;
  }

  return <Navigate to="/login" replace />;
}

export default DashboardRouter;
