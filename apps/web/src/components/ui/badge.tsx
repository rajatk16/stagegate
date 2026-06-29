import * as React from 'react';
import { Slot } from 'radix-ui';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib';

import { badgeVariants } from './variants';

export const Badge = ({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) => {
  const Comp = asChild ? Slot.Root : 'span';

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
};
