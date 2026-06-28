import type { PropsWithChildren } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

import { Form } from '../ui';

interface AppFormProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  onSubmit: (value: TFieldValues) => void;
  className?: string;
}

export const AppForm = <TFieldValues extends FieldValues>(
  props: PropsWithChildren<AppFormProps<TFieldValues>>,
) => (
  <Form {...props.form}>
    <form
      className={props.className}
      onSubmit={props.form.handleSubmit(props.onSubmit)}
    >
      {props.children}
    </form>
  </Form>
);
