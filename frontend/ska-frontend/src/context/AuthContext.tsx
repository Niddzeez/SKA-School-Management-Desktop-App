import { createContext, useContext } from "react";
import { usePersistentState } from "../hooks/UsePersistentState";
import type { Role } from "../types/Role";

type AuthContextType = {
  role: Role | null;
  isAuthenticated: boolean;

  loginAsAdmin: (code: string) => boolean;
  enterAsTeacher: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

// 🔒 Simple, intentional admin gate
const ADMIN_CODE = "ska-admin";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = usePersistentState<Role | null>(
    "auth_role",
    null
  );
  const [isAuthenticated, setIsAuthenticated] =
    usePersistentState<boolean>("auth_logged_in", false);

  const loginAsAdmin = (code: string) => {
    if (code !== ADMIN_CODE) return false;

    setRole("ADMIN");
    setIsAuthenticated(true);
    return true;
  };

  const enterAsTeacher = () => {
    setRole("TEACHER");
    setIsAuthenticated(true);
  };

  const logout = () => {
    setRole(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        isAuthenticated,
        loginAsAdmin,
        enterAsTeacher,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
