import { rolePresentations, type MembershipRole } from '../../organizations';

interface RoleBadgeProps {
  readonly role: MembershipRole;
}

export const RoleBadge = ({ role }: RoleBadgeProps) => {
  const presentation = rolePresentations[role];

  return (
    <span
      title={presentation.description}
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${presentation.className}`}
    >
      {presentation.label}
    </span>
  );
};
