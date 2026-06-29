import type { PropsWithChildren, ReactNode } from 'react';

import { cn } from '@/lib';

import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '../ui';

interface FormSectionProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export const FormSection = (props: PropsWithChildren<FormSectionProps>) => (
  <Card className={props.className}>
    <CardHeader className="flex flex-row items-start justify-between gap-4">
      <div className="space-y-1">
        <CardTitle>{props.title}</CardTitle>
        {props.description && (
          <CardDescription>{props.description}</CardDescription>
        )}
      </div>

      {props.actions}
    </CardHeader>

    <CardContent className={cn('space-y-6', props.contentClassName)}>
      {props.children}
    </CardContent>
  </Card>
);
