import { AlertTriangle } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from '../ui';

interface NavigationGuardDialogProps {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}

export const NavigationGuardDialog = ({
  open,
  onStay,
  onLeave,
}: NavigationGuardDialogProps) => (
  <AlertDialog open={open}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertTriangle className="mb-2 h-8 w-8 text-yellow-500" />

        <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
        <AlertDialogDescription>
          You have unsaved changes. Are you sure you want to leave?
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter>
        <AlertDialogCancel onClick={onStay}>Stay</AlertDialogCancel>
        <AlertDialogAction onClick={onLeave}>Leave Page</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
