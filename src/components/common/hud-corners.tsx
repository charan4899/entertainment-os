"use client";

import { cn } from "@/lib/utils";

interface HudCornersProps {
  /** Show a brighter, glowing state — used on hover/focus of the parent panel. */
  active?: boolean;
  className?: string;
}

const CORNER_POSITIONS = [
  "top-0 left-0 [transform:rotate(0deg)]",
  "top-0 right-0 [transform:rotate(90deg)]",
  "bottom-0 right-0 [transform:rotate(180deg)]",
  "bottom-0 left-0 [transform:rotate(270deg)]",
];

/**
 * Four L-shaped reticle brackets pinned to a panel's corners. This is the
 * app's signature element: a scan-frame that "locks on" to every panel,
 * reinforcing the targeting/intelligence-system read of the brief.
 */
export function HudCorners({ active = false, className }: HudCornersProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)} aria-hidden>
      {CORNER_POSITIONS.map((pos, i) => (
        <svg
          key={i}
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          className={cn(
            "absolute origin-center transition-all duration-300",
            pos,
            active ? "opacity-100" : "opacity-45"
          )}
        >
          <path
            d="M1 9V2.5C1 1.67157 1.67157 1 2.5 1H9"
            stroke={active ? "var(--color-primary-strong)" : "var(--color-primary)"}
            strokeWidth="1.5"
            strokeLinecap="round"
            style={
              active
                ? { filter: "drop-shadow(0 0 4px var(--color-primary))" }
                : undefined
            }
          />
        </svg>
      ))}
    </div>
  );
}
