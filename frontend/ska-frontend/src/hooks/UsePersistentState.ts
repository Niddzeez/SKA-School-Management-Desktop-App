import { useEffect, useState } from "react";

export function usePersistentState<T>(
  key: string,
  initialValue: T
) {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch (err) {
      console.error(`Failed to load ${key} from localStorage`, err);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (err) {
      console.error(`Failed to save ${key} to localStorage`, err);
    }
  }, [key, state]);

  return [state, setState] as const;
}
