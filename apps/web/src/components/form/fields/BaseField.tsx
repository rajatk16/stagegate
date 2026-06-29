import type { ReactNode } from 'react';
import {
  useFormContext,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import {
  FormItem,
  FormLabel,
  FormField,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui';

interface BaseFieldProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  label: string;
  description?: string;
  children(
    field: ReturnType<
      typeof useFormContext<TFieldValues>
    >['control'] extends never
      ? never
      : Parameters<
          Parameters<typeof FormField<TFieldValues>>[0]['render']
        >[0]['field'],
  ): ReactNode;
}

export const BaseField = <TFieldValues extends FieldValues>(
  props: BaseFieldProps<TFieldValues>,
) => {
  const { control } = useFormContext<TFieldValues>();

  return (
    <FormField
      control={control}
      name={props.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{props.label}</FormLabel>

          <FormControl>{props.children(field)}</FormControl>

          {props.description && (
            <FormDescription>{props.description}</FormDescription>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  );
};
