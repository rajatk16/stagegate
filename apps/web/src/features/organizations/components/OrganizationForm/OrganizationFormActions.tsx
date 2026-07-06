import { Button } from '@/components/ui';

interface Props {
  isSubmitting?: boolean;
  submitLabel?: string;
}

export const OrganizationFormActions = ({
  isSubmitting,
  submitLabel = 'Save',
}: Props) => (
  <div className="flex justify-end">
    <Button type="submit" disabled={isSubmitting}>
      {submitLabel}
    </Button>
  </div>
);
