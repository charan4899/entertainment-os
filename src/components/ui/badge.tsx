import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider",
  {
    variants: {
      variant: {
        neutral: "border-border bg-white/[0.03] text-text-muted",
        cyan: "border-primary/35 bg-primary-soft text-primary-strong",
        blue: "border-secondary/35 bg-secondary-soft text-[#a9c1ff]",
        purple: "border-accent/35 bg-accent-soft text-[#d6bbff]",
        green: "border-success/35 bg-success-soft text-success",
        amber: "border-warning/35 bg-warning-soft text-warning",
        danger: "border-danger/35 bg-danger-soft text-danger",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
