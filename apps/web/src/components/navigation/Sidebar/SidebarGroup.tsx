import { SidebarItem } from './SidebarItem';
import type { SidebarGroupModel } from './types';

export const SidebarGroup = ({ group }: { group: SidebarGroupModel }) => {
  return (
    <section>
      {group.title && (
        <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {group.title}
        </h2>
      )}
      <div className="space-y-1">
        {group.items.map((item) => (
          <SidebarItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};
