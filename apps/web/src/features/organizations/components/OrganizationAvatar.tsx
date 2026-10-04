import { Building2 } from 'lucide-react';

export const OrganizationAvatar = ({ name }: { name?: string }) => {
  const initials = name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => Array.from(word)[0])
    .join('')
    .toUpperCase();

  return (
    <span
      aria-hidden="true"
      className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-semibold text-primary"
    >
      {initials || <Building2 className="size-4" />}
    </span>
  );
};
