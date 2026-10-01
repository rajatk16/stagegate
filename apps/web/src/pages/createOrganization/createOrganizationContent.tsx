import { useState } from "react";
import { Link } from "react-router";
import { User } from "firebase/auth";

import { Organization } from "@/services";
import { useOrganizations } from "@/hooks";
import { CreateOrganizationForm } from "@/components/custom";
import {
  Card,
  Badge,
  Button,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui";

import { OrganizationCreated } from "./organizationCreated";

export const CreateOrganizationContent = ({ user }: { user: User }) => {
  const [createdOrganization, setCreatedOrganization] =
    useState<Organization | null>(null);
  const { reload } = useOrganizations();

  if (createdOrganization) {
    return <OrganizationCreated organization={createdOrganization} />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="max-w-2xl space-y-3">
        <Badge variant="secondary">Get started</Badge>

        <h1 className="text-3xl font-semibold tracking-tight">
          Create your organization
        </h1>

        <p className="leading-7 text-muted-foreground">
          An organization gives your team a shared home in StageGate. Start with
          a name and a unique slug.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Organization Details</h2>
            <CardDescription>
              Choose a name your team will recognize.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <CreateOrganizationForm
              user={user}
              onCreated={(organization) => {
                setCreatedOrganization(organization);
                reload();
              }}
            />
          </CardContent>
        </Card>

        <aside
          aria-labelledby="organization-help-title"
          className="space-y-5 rounded-2xl border bg-card p-6"
        >
          <h2 id="organization-help-title" className="text-lg font-semibold">
            Setting up your first organization
          </h2>

          <ul className="space-y-4 text-sm leading-6 text-muted-foreground">
            <li>Use your team, company, or group's name.</li>
            <li>Choose a short slug that is easy to recognize.</li>
            <li>Your account becomes the organization’s owner.</li>
          </ul>

          <p className="text-sm leading-6 text-muted-foreground">
            Already belong to an organization? You can return to your dashboard
            without creating another.
          </p>

          <Button asChild variant="outline" className="min-h-11">
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
};
