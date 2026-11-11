import { cn } from 'cn';
import { type VariantProps } from 'class-variance-authority';
import { Button as ButtonPrimitive } from '@base-ui/react/button';

import { buttonVariants } from '@/constants/variants';

export const Button = ({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) => {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
};
