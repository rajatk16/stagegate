import { useState } from 'react';

import { LoadingState } from '@/components/states';
import { Card, CardContent } from '@/components/ui';
import { Page, PageHeader } from '@/components/page';

import type { OrganizationMember } from '../../types';
import {
  MembersTable,
  RemoveMemberDialog,
  InviteMembersButton,
  EditMemberRoleDialog,
} from '../../components';
import {
  useRemoveMember,
  useUpdateMemberRole,
  useOrganizationMembers,
  useCurrentOrganization,
  useOrganizationPermissions,
  useCurrentOrganizationMember,
} from '../../hooks';

export const OrganizationMembersPage = () => {
  const [selectedMember, setSelectedMember] =
    useState<OrganizationMember | null>(null);
  const [memberToRemove, setMemberToRemove] =
    useState<OrganizationMember | null>(null);

  const organization = useCurrentOrganization();
  const { updateMemberRole, isPending } = useUpdateMemberRole();
  const { removeMember, isPending: isRemoving } = useRemoveMember();
  const permissions = useOrganizationPermissions(organization!.slug);
  const { data: currentMember, isLoading: isLoadingCurrentMember } =
    useCurrentOrganizationMember(organization!.slug);

  const {
    error,
    isError,
    refetch,
    isLoading,
    data: members = [],
  } = useOrganizationMembers(organization!.slug);

  if (!organization) {
    return null;
  }

  if (isLoadingCurrentMember) {
    return <LoadingState />;
  }

  return (
    <Page>
      <PageHeader
        title="Members"
        description="Manage the members of your organizations"
      />

      <div className="mb-4 flex justify-end">
        <InviteMembersButton onClick={() => {}} disabled />
      </div>

      <EditMemberRoleDialog
        currentMemberId={currentMember!.id}
        open={!!selectedMember}
        member={selectedMember}
        isSubmitting={isPending}
        onClose={() => setSelectedMember(null)}
        onSave={async (role) => {
          if (!selectedMember) {
            return;
          }

          await updateMemberRole({
            organizationSlug: organization.slug,
            userId: selectedMember.id,
            payload: {
              roles: [role],
            },
          });
          setSelectedMember(null);
        }}
      />

      <RemoveMemberDialog
        open={memberToRemove !== null}
        member={memberToRemove}
        isRemoving={isRemoving}
        onClose={() => setMemberToRemove(null)}
        onConfirm={async () => {
          if (!memberToRemove) return;

          await removeMember({
            organizationSlug: organization.slug,
            userId: memberToRemove.id,
          });
          setMemberToRemove(null);
        }}
      />

      <Card>
        <CardContent className="pt-6">
          <MembersTable
            error={error}
            refetch={refetch}
            isError={isError}
            members={members}
            onInvite={() => {}}
            isLoading={isLoading}
            onEditRole={setSelectedMember}
            currentMember={currentMember!}
            canManageMembers={permissions.canManageMembers}
            onRemoveMember={(member) => setMemberToRemove(member)}
          />
        </CardContent>
      </Card>
    </Page>
  );
};
