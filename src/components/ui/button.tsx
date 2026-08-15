import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary:
          "bg-primary/15 text-primary-strong border border-primary/40 hover:bg-primary/25 hover:border-primary/70 hover:shadow-[0_0_20px_-4px_var(--color-primary)]",
        secondary:
          "bg-panel text-text border border-border hover:border-border-strong hover:bg-panel-hover",
        ghost:
          "text-text-muted hover:text-text hover:bg-white/[0.04]",
        danger:
          "bg-danger/10 text-danger border border-danger/40 hover:bg-danger/20 hover:border-danger/70",
        success:
          "bg-success/10 text-success border border-success/40 hover:bg-success/20 hover:border-success/70",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
