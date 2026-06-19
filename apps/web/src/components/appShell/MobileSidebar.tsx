import { Menu } from 'lucide-react';
import { Button, Sheet, SheetContent, SheetTrigger } from '../ui';
import { Sidebar } from './Sidebar';

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
