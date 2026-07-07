import { useState } from 'react';

import {
  Card,
  Button,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '@/components/ui';

import { useArchiveOrganization } from '../../hooks';
import { ArchiveOrganizationDialog } from './ArchiveOrganizationDialog';

interface ArchiveOrganizationCardProps {
  organizationSlug: string;
  organizationName: string;
}

export const ArchiveOrganizationCard = ({
  organizationSlug,
  organizationName,
}: ArchiveOrganizationCardProps) => {
  const [open, setOpen] = useState(false);

  const { archiveOrganization, isPending } = useArchiveOrganization();

  return (
    <>
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>
            Archive this organization. It can be restored later.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button variant="destructive" onClick={() => setOpen(true)}>
            Archive Organization
          </Button>
        </CardContent>
      </Card>

      <ArchiveOrganizationDialog
        open={open}
        isArchiving={isPending}
        onCancel={() => setOpen(false)}
        organizationName={organizationName}
        onConfirm={() => archiveOrganization({ organizationSlug })}
      />
    </>
  );
};
