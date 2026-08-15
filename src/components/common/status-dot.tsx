import { cn } from "@/lib/utils";

interface StatusDotProps {
  color?: "primary" | "success" | "warning" | "danger";
  className?: string;
}

const COLOR_MAP: Record<NonNullable<StatusDotProps["color"]>, string> = {
  primary: "bg-primary text-primary",
  success: "bg-success text-success",
  warning: "bg-warning text-warning",
  danger: "bg-danger text-danger",
};

export function StatusDot({ color = "primary", className }: StatusDotProps) {
  return (
    <span className={cn("relative flex h-2 w-2", className)}>
      <span
        className={cn(
          "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
          COLOR_MAP[color]
        )}
      />
      <span
        className={cn(
          "relative inline-flex h-2 w-2 rounded-full",
          COLOR_MAP[color]
        )}
      />
    </span>
  );
}
