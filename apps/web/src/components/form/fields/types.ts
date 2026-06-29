import type { FieldPath, FieldValues } from 'react-hook-form';

export interface BaseFieldProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  label: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
}
