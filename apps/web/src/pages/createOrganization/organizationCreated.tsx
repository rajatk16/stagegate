import { Link } from "react-router";
import { useEffect, useRef } from "react";

import { Organization } from "@/services";
import { getOrganizationPath } from "@/lib";
import {
  Card,
  Badge,
  Button,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui";

export const OrganizationCreated = ({
  organization,
}: {
  organization: Organization;
}) => {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader className="space-y-3">
        <Badge variant="secondary">Organization created</Badge>

        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-semibold tracking-tight outline-none"
        >
          Your organization is ready.
        </h1>

        <CardDescription>
          {organization.name} has been created successfully.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <dl className="grid gap-5 rounded-xl border p-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">Organization name</dt>
            <dd className="mt-1 wrap-break-word font-medium">
              {organization.name}
            </dd>
          </div>

          <div>
            <dt className="text-sm text-muted-foreground">Slug</dt>
            <dd className="mt-1 break-all font-medium">{organization.slug}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Your role</dt>
            <dd className="mt-1 font-medium">Owner</dd>
          </div>
        </dl>

        <Button asChild className="min-h-11">
          <Link to={getOrganizationPath(organization.slug)}>
            Open organization
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
