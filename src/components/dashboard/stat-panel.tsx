"use client";

import type { LucideIcon } from "lucide-react";
import { GlassPanel } from "@/components/common/glass-panel";
import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";

type Accent = "cyan" | "blue" | "purple" | "green";

const ACCENT_STYLES: Record<Accent, { icon: string; ring: string; bar: string }> = {
  cyan: { icon: "text-primary", ring: "border-primary/30 bg-primary-soft", bar: "bg-primary" },
  blue: { icon: "text-[#7ea6ff]", ring: "border-secondary/30 bg-secondary-soft", bar: "bg-secondary" },
  purple: { icon: "text-[#c9a6ff]", ring: "border-accent/30 bg-accent-soft", bar: "bg-accent" },
  green: { icon: "text-success", ring: "border-success/30 bg-success-soft", bar: "bg-success" },
};

interface StatPanelProps {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  detail: string;
  accent: Accent;
  /** Relative bar heights (0-1) purely decorative — reads as a live signal readout. */
  pulse?: number[];
}

export function StatPanel({
  icon: Icon,
  label,
  value,
  suffix,
  detail,
  accent,
  pulse = [0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.45],
}: StatPanelProps) {
  const animated = useCountUp(value);
  const styles = ACCENT_STYLES[accent];

  return (
    <GlassPanel className="p-5">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg border",
            styles.ring
          )}
        >
          <Icon className={cn("h-5 w-5", styles.icon)} />
        </div>
        <div className="flex items-end gap-[3px]" aria-hidden>
          {pulse.map((h, i) => (
            <span
              key={i}
              className={cn("w-[3px] rounded-full opacity-70", styles.bar)}
              style={{ height: `${8 + h * 20}px` }}
            />
          ))}
        </div>
      </div>

      <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted">
        {label}
      </p>
      <p className="mt-1 font-display text-4xl font-semibold tabular-nums tracking-tight text-text">
        {animated.toLocaleString()}
        {suffix && <span className="ml-1 text-lg text-text-muted">{suffix}</span>}
      </p>
      <p className="mt-2 text-xs text-text-dim">{detail}</p>
    </GlassPanel>
  );
}
