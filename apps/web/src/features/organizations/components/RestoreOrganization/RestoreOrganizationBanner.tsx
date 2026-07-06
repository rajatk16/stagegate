import { RotateCcw } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle, Button } from '@/components/ui';

interface RestoreOrganizationBannerProps {
  isPending: boolean;
  onRestore: () => void;
}

export const RestoreOrganizationBanner = ({
  isPending,
  onRestore,
}: RestoreOrganizationBannerProps) => (
  <Alert>
    <RotateCcw className="h-4 w-4" />

    <AlertTitle>This organization is archived.</AlertTitle>

    <AlertDescription className="mt-2 flex items-center justify-between">
      <span>Archived organizations are read-only until restored.</span>

      <Button onClick={onRestore} disabled={isPending}>
        {isPending ? 'Restoring' : 'Restore Organization'}
      </Button>
    </AlertDescription>
  </Alert>
);
