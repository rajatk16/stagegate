import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui';

interface Props {
  disabled?: boolean;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export const OrganizationFormActions = ({
  disabled,
  isSubmitting,
  submitLabel = 'Save',
}: Props) => (
  <div className="flex justify-end">
    <Button type="submit" disabled={isSubmitting || disabled}>
      {isSubmitting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        submitLabel
      )}
    </Button>
  </div>
);
