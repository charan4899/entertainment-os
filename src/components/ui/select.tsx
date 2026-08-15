import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "h-10 w-full appearance-none rounded-lg border border-border bg-white/[0.02] pl-3.5 pr-9 text-sm text-text outline-none transition-colors duration-200",
            "focus:border-primary/60 focus:bg-white/[0.04] focus:shadow-[0_0_0_3px_var(--color-primary-soft)]",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-dim"
          aria-hidden
        />
      </div>
    );
  }
);
Select.displayName = "Select";
