"use client";

import { motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { HudCorners } from "./hud-corners";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  /** Adds a slow vertical scanline sweep — reserve for a couple of hero panels. */
  scan?: boolean;
  /** Disable the entrance animation, e.g. inside a list where it's redundant. */
  animate?: boolean;
}

export function GlassPanel({
  children,
  className,
  scan = false,
  animate = true,
}: GlassPanelProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className={cn(
        "glass-panel noise-veil relative overflow-hidden rounded-2xl",
        className
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={animate ? { opacity: 0, y: 14 } : undefined}
      whileInView={animate ? { opacity: 1, y: 0 } : undefined}
      viewport={animate ? { once: true, margin: "-40px" } : undefined}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <HudCorners active={hovered} />
      {scan && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-16 animate-scan"
          style={{
            background:
              "linear-gradient(180deg, transparent, var(--color-primary-soft), transparent)",
          }}
          aria-hidden
        />
      )}
      {children}
    </motion.div>
  );
}
