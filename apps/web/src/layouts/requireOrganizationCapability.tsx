import { Link, Outlet } from "react-router";

import { Button } from "@/components/ui";
import { getOrganizationPath } from "@/lib";
import { InlineAlert } from "@/components/custom";
import { useActiveOrganization, useOrganizations } from "@/hooks";
import { hasOrganizationCapability, OrganizationCapability } from "@/services"

type Props = {
  capability: OrganizationCapability;
}

export const RequireOrganization = (props: Props) => {
  const {capability} = props;

  const organization = useActiveOrganization();
  const { reload } = useOrganizations();

  if (!hasOrganizationCapability(organization, capability)) {
    return (
      <div className="space-y-4">
        <InlineAlert
          tone="warning"
          title="You don't have access to this page"
        >
          Your current organization permissions do not include this operation.
        </InlineAlert>

        <div className="flex flex-wrap gap-3">
          <Button asChild className="min-h-11">
            <Link to={getOrganizationPath(organization.slug)}>
              Back to overview
            </Link>
          </Button>

          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={reload}
          >
            Refresh access
          </Button>
        </div>
      </div>
    );
  }

  return <Outlet context={organization} />;
}