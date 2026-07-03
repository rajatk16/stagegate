import { OrganizationSwitcher } from '@/features/organizations';

export const TopNavigationStart = () => {
  return (
    <div className="flex items-center gap-2">
      <OrganizationSwitcher />
    </div>
  );
};
