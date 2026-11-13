import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { ComponentProps } from 'react';

export const Sheet = (props: ComponentProps<typeof DialogPrimitive.Root>) => {
  return <DialogPrimitive.Root {...props} />;
};

export const SheetTrigger = (props: ComponentProps<typeof DialogPrimitive.Trigger>) => {
  return <DialogPrimitive.Trigger {...props} />;
};

export const SheetClose = (props: ComponentProps<typeof DialogPrimitive.Close>) => {
  return <DialogPrimitive.Close {...props} />;
};

export const SheetTitle = ({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) => {
  return <DialogPrimitive.Title className={cn('text-lg font-semibold', className)} {...props} />;
};

export const SheetDescription = ({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) => {
  return (
    <DialogPrimitive.Description
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
};

export interface SheetContentProps extends ComponentProps<typeof DialogPrimitive.Content> {
  side?: 'left' | 'right';
}

export const SheetContent = ({
  className,
  children,
  side = 'right',
  ...props
}: SheetContentProps) => {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          'fixed inset-0 z-50 bg-black/50',
          'data-[state=open]:animate-in',
          'data-[state=closed]:animate-out',
          'data-[state=open]:fade-in-0',
          'data-[state=closed]:fade-out-0',
        )}
      />

      <DialogPrimitive.Content
        className={cn(
          'fixed inset-y-0 z-50 flex w-3/4 max-w-sm flex-col',
          'bg-background shadow-lg transition-transform',
          'data-[state=open]:animate-in',
          'data-[state=closed]:animate-out',
          side === 'left'
            ? 'left-0 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left'
            : 'right-0 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
          className,
        )}
        {...props}
      >
        {children}

        <DialogPrimitive.Close className="absolute top-4 right-4 rounded-md p-1 hover:bg-muted">
          <X className="size-5" aria-hidden="true" />
          <span className="sr-only">Close navigation</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
};
