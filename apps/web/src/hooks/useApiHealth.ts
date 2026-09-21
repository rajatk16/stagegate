import { useEffect, useState } from "react";

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

const HEALTH_URL = "/api/v1/health";
const TIMEOUT_MS = 8_000;

function isHealthyResponse(value: unknown): value is { status: "ok" } {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    value.status === "ok"
  );
}

export function useApiHealth() {
  const [state, setState] = useState<ConnectionState>({
    status: "loading",
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let timedOut = false;

    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, TIMEOUT_MS);

    async function checkHealth() {
      const startedAt = performance.now();

      try {
        const response = await fetch(HEALTH_URL, {
          signal: controller.signal,
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`The API returned HTTP ${response.status}.`);
        }

        const body: unknown = await response.json();

        if (!isHealthyResponse(body)) {
          throw new Error("The API returned an unexpected health response.");
        }

        if (active) {
          setState({
            status: "success",
            checkedAt: new Date(),
            latencyMs: Math.round(performance.now() - startedAt),
          });
        }
      } catch (error: unknown) {
        if (!active) return;

        let message = "Could not reach the API. Check the server and try again.";

        if (timedOut) {
          message = "The API did not respond within 8 seconds.";
        } else if (error instanceof SyntaxError) {
          message = "The API returned invalid JSON.";
        } else if (error instanceof Error && !(error instanceof TypeError)) {
          message = error.message;
        }

        setState({
          status: "failure",
          message,
        });
      } finally {
        window.clearTimeout(timeout);
      }
    }

    void checkHealth();

    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);

  function retry() {
    setState({ status: "loading" });
    setAttempt((current) => current + 1);
  }

  return { state, retry };
}
