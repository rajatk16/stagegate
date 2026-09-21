import {
  Server,
  XCircle,
  RefreshCw,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

import { useApiHealth } from "@/hooks";
import { 
  Card,
  Badge, 
  Button, 
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui";

const statusDisplay = {
  loading: {
    label: "Checking",
    icon: LoaderCircle,
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  },
  success: {
    label: "Connected",
    icon: CheckCircle2,
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  },
  failure: {
    label: "Connection failed",
    icon: XCircle,
    className:
      "border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-300",
  },
};

export function ApiConnection() {
  const { state, retry } = useApiHealth();
  const display = statusDisplay[state.status];
  const Icon = display.icon;

  const message =
    state.status === "loading"
      ? "Contacting the StageGate API…"
      : state.status === "success"
        ? "The API responded successfully."
        : state.message;

  return (
    <Card id="connection" className="scroll-mt-24 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <Server className="size-5" aria-hidden="true" />
          </div>

          <div>
            <CardTitle>API connection</CardTitle>
            <CardDescription className="mt-1">
              Check whether StageGate can reach its backend.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="space-y-3"
        >
          <Badge variant="outline" className={display.className}>
            <Icon
              aria-hidden="true"
              className={
                state.status === "loading"
                  ? "size-3.5 motion-safe:animate-spin"
                  : "size-3.5"
              }
            />
            {display.label}
          </Badge>

          <p className="text-sm text-muted-foreground">{message}</p>
        </div>

        {state.status === "success" && (
          <dl className="grid grid-cols-2 gap-4 rounded-xl bg-muted/60 p-4">
            <div>
              <dt className="text-xs text-muted-foreground">
                Response time
              </dt>
              <dd className="mt-1 text-sm font-medium">
                {state.latencyMs} ms
              </dd>
            </div>

            <div>
              <dt className="text-xs text-muted-foreground">
                Last checked
              </dt>
              <dd className="mt-1 text-sm font-medium">
                {state.checkedAt.toLocaleTimeString()}
              </dd>
            </div>
          </dl>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={retry}
          disabled={state.status === "loading"}
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          {state.status === "loading"
            ? "Checking…"
            : state.status === "failure"
              ? "Try again"
              : "Check again"}
        </Button>
      </CardContent>
    </Card>
  );
}
