import type { PropsWithChildren } from 'react';
import type {
  FieldValues,
  SubmitHandler,
  UseFormReturn,
} from 'react-hook-form';

import { cn } from '@/lib';

import { Form } from '../ui';

interface AppFormProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  onSubmit: SubmitHandler<TFieldValues>;
  className?: string;
}

export const AppForm = <TFieldValues extends FieldValues>(
  props: PropsWithChildren<AppFormProps<TFieldValues>>,
) => (
  <Form {...props.form}>
    <form
      noValidate
      className={cn('space-y-8', props.className)}
      onSubmit={props.form.handleSubmit(props.onSubmit)}
    >
      {props.children}
    </form>
  </Form>
);
