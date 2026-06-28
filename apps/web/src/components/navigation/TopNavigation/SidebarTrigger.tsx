import { Menu } from 'lucide-react';

import { Button } from '@/components/ui';

export const SidebarTrigger = () => (
  <Button
    variant="ghost"
    size="icon"
    className="lg:hidden"
    aria-label="Open Navivation"
  >
    <Menu className="h-5 w-5" />
  </Button>
);
