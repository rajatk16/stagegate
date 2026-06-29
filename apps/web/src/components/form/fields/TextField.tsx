import type { FieldValues } from 'react-hook-form';

import { Input } from '@/components/ui';

import { BaseField } from './BaseField';
import type { BaseFieldProps } from './types';

type TextFieldProps<TFieldValues extends FieldValues> =
  BaseFieldProps<TFieldValues>;

export const TextField = <TFieldValues extends FieldValues>(
  props: TextFieldProps<TFieldValues>,
) => {
  return (
    <BaseField {...props}>
      {(field) => (
        <Input
          {...field}
          disabled={props.disabled}
          placeholder={props.placeholder}
        />
      )}
    </BaseField>
  );
};
