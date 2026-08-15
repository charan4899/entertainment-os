"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { GlassPanel } from "@/components/common/glass-panel";
import type { GenreCount } from "@/lib/types";

const PALETTE = ["#22d3ee", "#3b6dff", "#a45bff", "#3cff9e", "#f5a524", "#ff5c7a", "#7ceeff", "#8fb4ff"];

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="glass-panel rounded-lg px-3 py-2 text-xs">
      <p className="font-medium text-text">{entry.name}</p>
      <p className="text-text-dim">{entry.value} watched</p>
    </div>
  );
}

export function GenreDistributionChart({ data }: { data: GenreCount[] }) {
  return (
    <GlassPanel className="p-6">
      <h2 className="mb-4 font-display text-lg font-semibold text-text">Genre Distribution</h2>
      {data.length === 0 ? (
        <p className="py-16 text-center text-sm text-text-dim">
          No genre data yet — mark titles as watched to populate this chart.
        </p>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="genre"
                innerRadius="55%"
                outerRadius="85%"
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={entry.genre} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      {data.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          {data.slice(0, 8).map((entry, i) => (
            <div key={entry.genre} className="flex items-center gap-1.5 text-xs text-text-muted">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
              />
              {entry.genre}
            </div>
          ))}
        </div>
      )}
    </GlassPanel>
  );
}
