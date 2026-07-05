import { Card, CardContent } from '@/components/ui';
import { Page, PageHeader } from '@/components/page';

import { MembersTable } from '../../components';
import { useCurrentOrganization, useOrganizationMembers } from '../../hooks';

export const OrganizationMembersPage = () => {
  const organization = useCurrentOrganization();

  const {
    error,
    isError,
    isLoading,
    data: members = [],
  } = useOrganizationMembers(organization.slug);

  if (!organization) {
    return null;
  }

  return (
    <Page>
      <PageHeader
        title="Members"
        description="Manage the members of your organizations"
      />

      <Card>
        <CardContent className="pt-6">
          <MembersTable
            error={error}
            isError={isError}
            members={members}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </Page>
  );
};
