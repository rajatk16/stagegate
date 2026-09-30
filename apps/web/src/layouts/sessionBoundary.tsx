import { PropsWithChildren } from "react";
import { LoaderCircle } from "lucide-react";

import { useAuth } from "@/hooks";

export const SessionBoundary = (props: PropsWithChildren) => {
  const session = useAuth();

  if (session.status === "loading") {
    return (
      <main
        id="main-content"
        tabIndex={-1}
        aria-busy="true"
        className="flex min-h-[60vh] flex-1 items-center justify-center bg-background px-6 text-foreground outline-none"
      >
        <div
          role="status"
          className="space-y-4 text-center"
        >
          <LoaderCircle 
            aria-hidden="true"
            className="mx-auto size-6 text-primary motion-safe:animate-spin"
          />
          <h1 className="text-xl font-semibold">
            Opening StageGate
          </h1>

          <p className="text-sm text-muted-foreground">
            Restoring your session...
          </p>
          </div>
      </main>
    );
  }

  return <>{props.children}</>;
};
