import { Building2 } from 'lucide-react';

import { Button } from '@/components/ui';

export const OrganizationSwitcher = () => (
  <Button variant="outline" className="justify-start gap-2">
    <Building2 className="h-4 w-4" />
    <span>No Organization</span>
  </Button>
);
