import { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "../services/apiClient";

export type SystemLogEvent = string;

export interface SystemLog {
  id: string;
  event: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

type SystemLogContextType = {
  logs: SystemLog[];
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  loadMoreLogs: () => Promise<void>;
  addLog: (
    event: SystemLogEvent,
    academicYear: string,
    details?: string
  ) => void;
};

const SystemLogContext = createContext<SystemLogContextType | null>(null);

export function SystemLogProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Initial Fetch
  useEffect(() => {
    async function loadInitialLogs() {
      try {
        setLoading(true);
        setError(null);
        // Load default limit 50
        const data = await apiClient.get<SystemLog[]>("/api/system/activity?limit=50");
        setLogs(data);
        if (data.length < 50) setHasMore(false);
      } catch (err: any) {
        setError(err.message || "Failed to load system logs");
      } finally {
        setLoading(false);
      }
    }
    loadInitialLogs();
  }, []);

  const loadMoreLogs = async () => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get<SystemLog[]>(
        `/api/system/activity?limit=50&offset=${logs.length}`
      );
      setLogs((prev) => [...prev, ...data]);
      if (data.length < 50) setHasMore(false);
      setPage((p) => p + 1);
    } catch (err: any) {
      setError(err.message || "Failed to load older logs");
    } finally {
      setLoading(false);
    }
  };

  /**
   * NO-OP Compatibility implementation.
   * Logs are exclusively derived from the backend event streams.
   */
  const addLog = (
    _event: SystemLogEvent,
    _academicYear: string,
    _details?: string
  ) => {
    // Intentionally suppressed purely viewing backend.
  };

  return (
    <SystemLogContext.Provider
      value={{ logs, loading, error, page, hasMore, loadMoreLogs, addLog }}
    >
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
