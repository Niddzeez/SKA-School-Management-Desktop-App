import { createContext, useContext } from "react";
import { usePersistentState } from "../hooks/UsePersistentState";
import type { Role } from "../types/Role";

type AuthContextType = {
  role: Role;
  setRole: (role: Role) => void;
  teacherId: string | null;
  setTeacherId : (id: string|null) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = usePersistentState<Role>("currentRole", "ADMIN");
  const [teacherId, setTeacherId] = usePersistentState<string | null>(
  "currentTeacherId",
  null
);


  return (
    <AuthContext.Provider value={{ role, setRole , teacherId, setTeacherId }}>
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
