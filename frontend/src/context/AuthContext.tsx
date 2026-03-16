import { createContext, useContext, useEffect, useState } from "react";
import type { Role } from "../types/Role";
import { apiClient } from "../services/apiClient";

type AuthContextType = {
  token: string | null;
  userId: string | null;
  name: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("ska_token"));
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("ska_token");
      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);

      try {
        const data = await apiClient.get<({
          userId: string;
          name: string;
          role: Role;
        })>("/api/auth/me", { disableAuthRedirect: true });

        setUserId(data.userId);
        setName(data.name);
        setRole(data.role);
        setIsAuthenticated(true);
      } catch (err: any) {
        localStorage.removeItem("ska_token");
        setToken(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const data = await apiClient.post<{
        token: string;
        userId: string;
        name: string;
        role: Role;
      }>("/api/auth/login", { email, password });

      localStorage.setItem("ska_token", data.token);
      setToken(data.token);
      setUserId(data.userId);
      setName(data.name);
      setRole(data.role);
      setIsAuthenticated(true);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to login");
    }
  };

  const logout = () => {
    localStorage.removeItem("ska_token");
    setToken(null);
    setUserId(null);
    setName(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        userId,
        name,
        role,
        isAuthenticated,
        loading,
        error,
        login,
        logout,
        clearError,
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
