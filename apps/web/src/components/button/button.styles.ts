import { cva } from "class-variance-authority";

export const buttonStyles = cva(
  [
    "inline-flex",
    "items-center",
    "justify-center",
    "rounded-lg",
    "font-medium",
    "transition-all",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "disabled:pointer-events-none"
  ],
  {
    variants: {
      variant: {
        primary: "bg-primary-600 text-white hover:bg-primary-700",
        secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
        outline: "border border-zinc-300 text-zinc-900 hover:bg-zinc-100",
        ghost: "hover:bg-zinc-100",
        danger: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-10 px-4",
        lg: "h-12 px-6",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
);
