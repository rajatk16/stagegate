import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '@/components/ui';

import { OrganizationForm } from '../../components';
import { useCreateOrganization } from '../../hooks';
import type { OrganizationFormValues } from '../../components/OrganizationForm/types';

export const CreateOrganizationPage = () => {
  const { createOrganization, isPending } = useCreateOrganization();

  const handleSubmit = async (values: OrganizationFormValues) => {
    await createOrganization(values);
  };
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Create Organization</h1>

        <p className="text-muted-foreground">
          Organizations are the top-level workspace in StageGate. Events,
          Proposals, and everything else belongs to it.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>
            Provide some basic information to get started.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <OrganizationForm
            onSubmit={handleSubmit}
            isSubmitting={isPending}
            submitLabel="Create Organization"
          />
        </CardContent>
      </Card>
    </div>
  );
};
