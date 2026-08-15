"use client";

import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export function Switch({ checked, onChange, disabled, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200 disabled:opacity-40",
        checked
          ? "border-primary/50 bg-primary-soft"
          : "border-border bg-white/[0.04]"
      )}
    >
      <span
        className={cn(
          "absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-all duration-200",
          checked
            ? "left-[22px] bg-primary shadow-[0_0_8px_var(--color-primary)]"
            : "left-1 bg-text-dim"
        )}
      />
    </button>
  );
}
