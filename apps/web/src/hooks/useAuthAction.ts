import { getAuthErrorMessage } from "@/lib";
import { useRef, useState } from "react";

export const useAuthAction = () => {
  const lock = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async <T>(operation: () => Promise<T>) => {
    if (lock.current) return {
      ok: false
    };

    lock.current = true;
    setPending(true);
    setError(null);

    try {
      return {
        ok: true,
        value: await operation()
      }
    } catch (error: unknown) {
      setError(getAuthErrorMessage(error));
      return {
        ok: false
      }
    } finally {
      lock.current = false;
      setPending(false);
    }
  }

  return {
    pending,
    error,
    run,
    clearError: () => setError(null)
  };
}
