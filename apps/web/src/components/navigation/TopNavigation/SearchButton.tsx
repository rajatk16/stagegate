import { Search } from 'lucide-react';

import { Button } from '@/components/ui';

export const SearchButton = () => (
  <Button variant="ghost" size="icon" aria-label="Search">
    <Search className="h-5 w-5" />
  </Button>
);
