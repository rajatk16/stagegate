import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "../../lib/cn";
import { buttonStyles } from "./button.styles";

interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = forwardRef<
  HTMLButtonElement, 
  ButtonProps
>(
  (
    {
      className,
      loading,
      children,
      variant,
      size,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          buttonStyles({
            variant,
            size
          }), 
          className
        )}
        disabled={loading}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {children}
      </button>
    )  
  }
);
