import { createContext, useContext } from "react";
import { usePersistentState } from "../hooks/UsePersistentState";
import type { SystemLog, SystemLogEvent } from "../types/SystemLog";

type SystemLogContextType = {
  logs: SystemLog[];
  addLog: (
    event: SystemLogEvent,
    academicYear: string,
    details?: string
  ) => void;
};

const SystemLogContext = createContext<SystemLogContextType | null>(null);

export function SystemLogProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = usePersistentState<SystemLog[]>("systemLogs", []);

  const addLog = (
    event: SystemLogEvent,
    academicYear: string,
    details?: string
  ) => {
    setLogs(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        event,
        academicYear,
        timestamp: new Date().toISOString(),
        details,
      },
    ]);
  };

  return (
    <SystemLogContext.Provider value={{ logs, addLog }}>
      {children}
    </SystemLogContext.Provider>
  );
}

export function useSystemLogs() {
  const ctx = useContext(SystemLogContext);
  if (!ctx) {
    throw new Error("useSystemLogs must be used within SystemLogProvider");
  }
  return ctx;
}
