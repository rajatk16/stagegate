import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Card,
  Input,
  Button,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '@/components/ui';

import { useOrganizationStore } from '../store';
import { useOrganizations } from '../selectors';
import { useCreateOrganization } from '../hooks';
import {
  createOrganizationSchema,
  type CreateOrganizationFormValues,
} from '../schemas';

export default function CreateOrganizationPage() {
  const navigate = useNavigate();

  const organizations = useOrganizations();

  const setOrganizations = useOrganizationStore(
    (state) => state.setOrganizations,
  );
  const setCurrentOrganization = useOrganizationStore(
    (state) => state.setCurrentOrganization,
  );
  const createOrganizationMutation = useCreateOrganization();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOrganizationFormValues>({
    resolver: zodResolver(createOrganizationSchema),
  });

  const onSubmit = async (values: CreateOrganizationFormValues) => {
    const organization = await createOrganizationMutation.mutateAsync(values);

    if (organization) {
      setOrganizations([...organizations, organization]);
      setCurrentOrganization(organization);
      navigate('/dashboard');
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create Organization</CardTitle>

          <CardDescription>
            Organizations contain events, proposals, and their reviews and
            reviewers.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Organization Name
              </label>

              <Input placeholder="StageGate" {...register('name')} />

              {errors.name && (
                <p className="mt-2 text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {createOrganizationMutation.error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                Failed to create organization. Please try again.
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={createOrganizationMutation.isPending}
              >
                {createOrganizationMutation.isPending
                  ? 'Creating...'
                  : 'Create Organization'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
