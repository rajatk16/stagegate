import type { FieldValues, UseFormReturn } from 'react-hook-form';

import { useBeforeUnload } from './useBeforeUnload';
import { useNavigationGuard } from './useNavigationGuard';

export function useUnsavedChanges<T extends FieldValues>(
  form: UseFormReturn<T>,
) {
  const dirty = form.formState.isDirty;

  useBeforeUnload({
    enabled: dirty,
  });

  const blocker = useNavigationGuard(dirty);

  return {
    hasUnsavedChanges: dirty,
    blocker,
  };
}
