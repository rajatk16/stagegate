import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib';

import { alertVariants } from './variants';

export const Alert = ({
  variant,
  className,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) => (
  <div
    data-slot="alert"
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
);

export const AlertTitle = ({
  className,
  ...props
}: React.ComponentProps<'div'>) => (
  <div
    data-slot="alert-title"
    className={cn(
      'col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight',
      className,
    )}
    {...props}
  />
);

export const AlertDescription = ({
  className,
  ...props
}: React.ComponentProps<'div'>) => (
  <div
    data-slot="alert-description"
    className={cn(
      'col-start-2 grid justify-items-start gap-1 text-sm text-muted-foreground [&_p]:leading-relaxed',
      className,
    )}
    {...props}
  />
);
