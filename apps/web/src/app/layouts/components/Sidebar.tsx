import { NavLink } from 'react-router-dom';

import { navItems } from '@/app';
import { OrganizationSwitcher } from '@/features/organizations';

export const Sidebar = () => {
  return (
    <aside className="hidden w-72 border-r bg-background lg:flex lg:flex-col">
      <div className="p-4">
        <OrganizationSwitcher />
      </div>

      <div className="px-3">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `
                mb-1
                flex
                items-center
                gap-3
                rounded-lg
                px-3
                py-2
                transition-colors
                ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }
                `
              }
            >
              <Icon size={18} />

              {item.label}
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};
