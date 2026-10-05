import { Badge } from '@/components';

import type { OrganizationRole } from '../services/organization';
import type {
  OrganizationMember,
  OrganizationMembershipStatus,
} from '../services/members';

type Props = {
  members: OrganizationMember[];
  currentUserUid: string;
  organizationName: string;
};

const roleLabels: Record<OrganizationRole, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MEMBER: 'Member',
  VIEWER: 'Viewer',
};

const statusLabels: Record<OrganizationMembershipStatus, string> = {
  ACTIVE: 'Active',
};

const joinedDateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
});

export const OrganizationMembersTable = ({
  members,
  currentUserUid,
  organizationName,
}: Props) => (
  <div
    role="region"
    aria-label={`${organizationName} team`}
    className={
      'overflow-x-auto rounded-xl border ' +
      'focus-visible:outline-none focus-visible:ring-2 ' +
      'focus-visible:ring-ring focus-visible:ring-offset-2'
    }
  >
    <table className="w-full min-w-160 text-left text-sm">
      <caption className="sr-only">
        Members of {organizationName}, including their roles, membership status,
        and joining dates.
      </caption>

      <thead className="border-b bg-muted/50 text-muted-foreground">
        <tr>
          <th scope="col" className="px-5 py-4 font-medium">
            Member
          </th>
          <th scope="col" className="px-5 py-4 font-medium">
            Role
          </th>
          <th scope="col" className="px-5 py-4 font-medium">
            Membership status
          </th>
          <th scope="col" className="px-5 py-4 font-medium">
            Joined
          </th>
        </tr>
      </thead>

      <tbody className="divide-y">
        {members.map((member) => (
          <tr key={member.uid} className="align-top">
            <th scope="row" className="px-5 py-4 text-left font-normal">
              <div className="flex items-start gap-3">
                <div
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                >
                  {Array.from(
                    member.displayName ?? member.email ?? '?',
                  )[0]?.toLocaleUpperCase()}
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="max-w-sm wrap-break-word font-medium">
                      {member.displayName ??
                        member.email ??
                        'Member details unavailable'}
                    </span>
                    {member.uid === currentUserUid && (
                      <Badge variant="secondary">You</Badge>
                    )}
                  </div>
                  {member.displayName !== null && member.email !== null && (
                    <p className="max-w-sm break-all text-sm text-muted-foreground">
                      {member.email}
                    </p>
                  )}
                </div>
              </div>
            </th>

            <td className="px-5 py-4">
              <Badge variant="outline">{roleLabels[member.role]}</Badge>
            </td>

            <td className="px-5 py-4">
              <Badge
                variant="outline"
                className={
                  'border-emerald-600/30 bg-emerald-500/10 ' +
                  'text-emerald-800 dark:text-emerald-200'
                }
              >
                {statusLabels[member.status]}
              </Badge>
            </td>

            <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
              <time dateTime={member.createdAt}>
                {joinedDateFormatter.format(new Date(member.createdAt))}
              </time>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
