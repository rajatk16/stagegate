import { Users } from 'lucide-react';

interface Props {
  message?: string;
}

export const OrganizationMemberPickerEmpty = (props: Props) => (
  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
    <Users className="mb-4 h-10 w-10 text-muted-foreground" />

    <h3 className="text-sm font-semibold">No Members Found</h3>

    <p className="mt-2 max-w-xs text-sm text-muted-foreground">
      {props.message}
    </p>
  </div>
);
