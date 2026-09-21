import { useEffect, useState } from "react";

import { getHealth } from "@/services";

type ConnectionState =
  | { status: "loading" }
  | {
      status: "success";
      checkedAt: Date;
      latencyMs: number;
    }
  | {
      status: "failure";
      message: string;
    };

export function useApiHealth() {
  const [state, setState] = useState<ConnectionState>({
    status: "loading",
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const checkHealth = async () => {
      const startedAt = performance.now();

      try {
        await getHealth(controller.signal);

        if (active) {
          setState({
            status: "success",
            checkedAt: new Date(),
            latencyMs: Math.round(performance.now() - startedAt),
          });
        }
      } catch (error: unknown) {
        if (!active) return;

        setState({
          status: "failure",
          message: error instanceof Error ? error.message : 'An unexpected connection error occurred.'
        });
      }
    }

    void checkHealth();

    return () => {
      active = false;
      controller.abort();
    };
  }, [attempt]);

  const retry = () => {
    setState({ status: "loading" });
    setAttempt((current) => current + 1);
  }

  return { state, retry };
}
