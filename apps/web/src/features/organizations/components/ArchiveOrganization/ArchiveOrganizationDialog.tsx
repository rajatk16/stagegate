import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from '@/components/ui';

interface ArchiveOrganizationDialogProps {
  open: boolean;
  isArchiving: boolean;
  organizationName: string;

  onConfirm: () => void;
  onCancel: () => void;
}

export const ArchiveOrganizationDialog = (
  props: ArchiveOrganizationDialogProps,
) => (
  <AlertDialog open={props.open}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Archive Organization</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to archive{' '}
          <strong>{props.organizationName}?</strong>
          <br />
          <br />
          The organization will become read-only untill it is restored.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter>
        <AlertDialogCancel
          disabled={props.isArchiving}
          onClick={props.onCancel}
        >
          Cancel
        </AlertDialogCancel>

        <AlertDialogAction
          disabled={props.isArchiving}
          onClick={props.onConfirm}
        >
          {props.isArchiving ? 'Archiving...' : 'Archive Organization'}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
