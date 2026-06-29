import { useCallback } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

import { mapApiFormErrors } from './mapApiFormErrors';

export const useApiFormErrors = <TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
) => useCallback((error: unknown) => mapApiFormErrors(form, error), [form]);
