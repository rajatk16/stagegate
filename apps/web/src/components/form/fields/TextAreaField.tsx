import type { FieldValues } from 'react-hook-form';

import { Textarea } from '@/components/ui';

import { BaseField } from './BaseField';
import type { BaseFieldProps } from './types';

interface TextAreaFieldProps<
  TFieldValues extends FieldValues,
> extends BaseFieldProps<TFieldValues> {
  rows?: number;
}

export const TextAreaField = <TFieldValues extends FieldValues>(
  props: TextAreaFieldProps<TFieldValues>,
) => {
  return (
    <BaseField {...props}>
      {(field) => (
        <Textarea
          {...field}
          disabled={props.disabled}
          rows={props.rows}
          placeholder={props.placeholder}
        />
      )}
    </BaseField>
  );
};
