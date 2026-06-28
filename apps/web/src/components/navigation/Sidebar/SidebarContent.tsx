import { SidebarGroup } from './SidebarGroup';
import type { SidebarGroupModel } from './types';

export const SidebarContent = ({
  navigation,
}: {
  navigation: SidebarGroupModel[];
}) => {
  return (
    <div className="flex-1 space-y-8 p-4">
      {navigation.map((group) => (
        <SidebarGroup key={group.id} group={group} />
      ))}
    </div>
  );
};
