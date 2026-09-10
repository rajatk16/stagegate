import { useAuth } from '../../../lib';
import { RoleBadge } from './RoleBadge';
import type { OrganizationMember } from '../services';
import { rolePresentations } from '../../organizations';

interface MemberListProps {
  readonly members: readonly OrganizationMember[];
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const formatDate = (value: string) => dateFormatter.format(new Date(value));

export const MemberList = ({ members }: MemberListProps) => {
  const auth = useAuth();

  const currentUserId = auth.status === 'authenticated' ? auth.user.uid : null;

  if (members.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <h2 className="text-base font-semibold text-slate-950">No members found</h2>
        <p className="mt-2 text-sm text-slate-600">
          This organization does not currently have any visible members.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <caption className="sr-only">Organization members and their assigned roles</caption>

          <thead className="bg-slate-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                scope="col"
              >
                Member
              </th>

              <th
                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                scope="col"
              >
                Role
              </th>

              <th
                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                scope="col"
              >
                Status
              </th>

              <th
                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                scope="col"
              >
                Joined
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {members.map((member) => {
              const role = rolePresentations[member.role];
              const isCurrentUser = member.userId === currentUserId;

              return (
                <tr key={member.membershipId}>
                  <th className="px-6 py-4 text-left" scope="row">
                    <div className="font-semibold text-slate-950">
                      {member.displayName ?? 'Unnamed member'}

                      {isCurrentUser ? (
                        <span className="ml-2 text-sm font-normal text-slate-500">You</span>
                      ) : null}
                    </div>

                    {member.displayName === null ? (
                      <div className="mt-1 text-xs text-slate-500">Profile name not provided</div>
                    ) : null}
                  </th>

                  <td className="px-6 py-4">
                    <RoleBadge role={member.role} />

                    <p className="mt-2 max-w-xs text-xs text-slate-500">{role.description}</p>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={
                        member.status === 'ACTIVE'
                          ? 'inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800'
                          : 'inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibild text-slate-700'
                      }
                    >
                      {member.status === 'ACTIVE'
                        ? 'Active'
                        : member.status === 'SUSPENDED'
                          ? 'Suspended'
                          : 'Removed'}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                    <time dateTime={member.createdAt}>{formatDate(member.createdAt)}</time>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
