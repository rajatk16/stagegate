import type { FieldValues, UseFormReturn } from 'react-hook-form';

export interface ApiValidationErrors {
  [field: string]: string | string[];
}

export interface ApiFormError {
  errors?: ApiValidationErrors;
}

export interface ApiErrorMapperOptions<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
}
