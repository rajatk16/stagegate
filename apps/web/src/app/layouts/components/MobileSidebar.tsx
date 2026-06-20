import { Menu } from 'lucide-react';

import { Sidebar } from './Sidebar';
import { Button, Sheet, SheetContent, SheetTrigger } from '@/components/ui';

export const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="p-0">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};
