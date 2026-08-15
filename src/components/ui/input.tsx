import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-lg border border-border bg-white/[0.02] px-3.5 text-sm text-text placeholder:text-text-dim outline-none transition-colors duration-200",
          "focus:border-primary/60 focus:bg-white/[0.04] focus:shadow-[0_0_0_3px_var(--color-primary-soft)]",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
