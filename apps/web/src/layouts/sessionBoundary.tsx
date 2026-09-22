import { PropsWithChildren } from "react";
import { Layers3, LoaderCircle } from "lucide-react";

import { useAuth } from "@/hooks";

export const SessionBoundary = (props: PropsWithChildren) => {
  const session = useAuth();

  if (session.status === 'loading') {
    return (
      <main
        aria-busy="true"
        className="stagegate-surface flex min-h-screen items-center justify-center bg-background px-6 text-foreground"
      >
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center gap-5 text-center"
        >
          <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
            <Layers3 className="size-7" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-semibold tracking-tight">
              Opening StageGate
            </h1>

            <p className="text-sm text-muted-foreground">
              Restoring your session...
            </p>
          </div>

          <LoaderCircle className="size-5 text-primary motion-safe:animate-spin" aria-hidden="true" />
        </div>
      </main>
    )
  }

  return <>{props.children}</>;
}
