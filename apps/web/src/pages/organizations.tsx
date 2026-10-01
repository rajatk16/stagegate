import { Navigate } from "react-router";

import { Button } from "@/components/ui";
import { useOrganizations } from "@/hooks";
import { InlineAlert } from "@/components/custom";

export const Organizations = () => {
  const { state, reload } = useOrganizations();

  if (state.status === "loading") {
    return (
      <p role="status" className="text-muted-foreground">
        Opening your organizations...
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <div className="space-y-4">
        <InlineAlert tone="error" title="Could not load your organizations">
          {state.message}
        </InlineAlert>

        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={reload}
        >
          Try again
        </Button>
      </div>
    );
  }

  const firstOrganization = state.organizations[0];

  if (!firstOrganization) {
    return <Navigate to="/organizations/new" replace />;
  }

  return (
    <Navigate
      to={`/organizations/${firstOrganization.slug}`}
      replace
    />
  );
};
