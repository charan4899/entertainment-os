"use client";

import { motion } from "framer-motion";
import { GlassPanel } from "@/components/common/glass-panel";
import type { WatchedItem } from "@/lib/types";

const BAR_COLORS = [
  "bg-primary",
  "bg-secondary",
  "bg-accent",
  "bg-success",
  "bg-warning",
];

export function GenreSignal({ watched }: { watched: WatchedItem[] }) {
  const counts = new Map<string, number>();
  for (const item of watched) {
    for (const genre of item.genres) {
      counts.set(genre, (counts.get(genre) ?? 0) + 1);
    }
  }

  const top = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const max = top[0]?.[1] ?? 1;

  return (
    <GlassPanel className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-text">
          Genre Signal
        </h2>
        <span className="font-mono text-[11px] uppercase tracking-widest text-text-dim">
          Top 5
        </span>
      </div>

      <div className="space-y-4">
        {top.length === 0 && (
          <p className="py-6 text-center text-sm text-text-dim">
            No signal yet — mark titles as watched and your genre profile
            will build here.
          </p>
        )}
        {top.map(([genre, count], i) => (
          <div key={genre}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-text-muted">{genre}</span>
              <span className="font-mono text-text-dim">{count}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(count / max) * 100}%` }}
                transition={{ duration: 0.8, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
              />
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
