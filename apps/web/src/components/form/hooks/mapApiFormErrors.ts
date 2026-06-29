import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';

import { AppError } from '@/lib';

export const mapApiFormErrors = <TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  error: unknown,
) => {
  if (!(error instanceof AppError)) {
    return;
  }

  const errors = (
    error.details as {
      errors?: Record<string, string | string[]>;
    }
  )?.errors;

  if (!errors) {
    return;
  }

  Object.entries(errors).forEach(([field, value]) => {
    form.setError(field as Path<TFieldValues>, {
      type: 'server',
      message: Array.isArray(value) ? value[0] : value,
    });
  });
};
