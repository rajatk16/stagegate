import { useSidebar } from '@/app/hooks';
import { Sheet, SheetContent } from '@/components/ui';

import { SidebarFooter } from './SidebarFooter';
import type { SidebarGroupModel } from './types';
import { SidebarContent } from './SidebarContent';

interface MobileSidebarProps {
  navigation: SidebarGroupModel[];
}

export const MobileSidebar = (props: MobileSidebarProps) => {
  const { mobileOpen, closeMobileSidebar } = useSidebar();

  return (
    <Sheet open={mobileOpen} onOpenChange={closeMobileSidebar}>
      <SheetContent side="left" className="w-72 p-0">
        <SidebarContent navigation={props.navigation} />

        <SidebarFooter />
      </SheetContent>
    </Sheet>
  );
};
