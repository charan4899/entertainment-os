"use client";

import { motion } from "framer-motion";
import { Bookmark, Cpu, Eye, Star } from "lucide-react";
import type { ActivityEvent } from "@/lib/types";
import { GlassPanel } from "@/components/common/glass-panel";
import { formatRelative } from "@/lib/utils";
import { cn } from "@/lib/utils";

const KIND_STYLES: Record<
  ActivityEvent["kind"],
  { icon: typeof Eye; classes: string }
> = {
  watched: { icon: Eye, classes: "border-primary/30 bg-primary-soft text-primary" },
  watchlist: { icon: Bookmark, classes: "border-secondary/30 bg-secondary-soft text-[#8fb4ff]" },
  favorite: { icon: Star, classes: "border-warning/30 bg-warning-soft text-warning" },
  system: { icon: Cpu, classes: "border-accent/30 bg-accent-soft text-[#c9a6ff]" },
};

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <GlassPanel className="p-6" scan>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-text">
          Recent Activity
        </h2>
        <span className="font-mono text-[11px] uppercase tracking-widest text-text-dim">
          Live feed
        </span>
      </div>

      <ul className="space-y-1">
        {events.length === 0 && (
          <li className="px-2 py-8 text-center text-sm text-text-dim">
            No activity yet — mark a title watched or queue one to get started.
          </li>
        )}
        {events.slice(0, 8).map((event, i) => {
          const style = KIND_STYLES[event.kind];
          const Icon = style.icon;
          return (
            <motion.li
              key={event.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
              className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-white/[0.03]"
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                  style.classes
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-text">
                  <span className="font-medium">{event.label}</span>
                  <span className="text-text-muted"> — {event.detail}</span>
                </p>
              </div>
              <span className="shrink-0 font-mono text-[11px] text-text-dim">
                {formatRelative(event.timestamp)}
              </span>
            </motion.li>
          );
        })}
      </ul>
    </GlassPanel>
  );
}
