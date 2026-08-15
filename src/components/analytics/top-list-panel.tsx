"use client";

import { motion } from "framer-motion";
import { GlassPanel } from "@/components/common/glass-panel";

interface RankedEntry {
  label: string;
  count: number;
}

interface TopListPanelProps {
  title: string;
  entries: RankedEntry[];
  emptyMessage: string;
}

export function TopListPanel({ title, entries, emptyMessage }: TopListPanelProps) {
  const max = entries[0]?.count ?? 1;

  return (
    <GlassPanel className="p-6">
      <h2 className="mb-4 font-display text-lg font-semibold text-text">{title}</h2>
      {entries.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-dim">{emptyMessage}</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, i) => (
            <div key={entry.label}>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-text-muted">
                  <span className="font-mono text-text-dim">{String(i + 1).padStart(2, "0")}</span>
                  {entry.label}
                </span>
                <span className="font-mono text-text-dim">{entry.count}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(entry.count / max) * 100}%` }}
                  transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassPanel>
  );
}
