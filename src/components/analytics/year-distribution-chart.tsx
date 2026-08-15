"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GlassPanel } from "@/components/common/glass-panel";
import type { YearCount } from "@/lib/types";

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel rounded-lg px-3 py-2 text-xs">
      <p className="font-medium text-text">{label}</p>
      <p className="text-text-dim">{payload[0].value} watched</p>
    </div>
  );
}

export function YearDistributionChart({ data }: { data: YearCount[] }) {
  return (
    <GlassPanel className="p-6">
      <h2 className="mb-4 font-display text-lg font-semibold text-text">Release Year Distribution</h2>
      {data.length === 0 ? (
        <p className="py-16 text-center text-sm text-text-dim">
          No release-year data yet — mark titles as watched to populate this chart.
        </p>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="year"
                stroke="var(--color-text-dim)"
                fontSize={11}
                fontFamily="var(--font-mono)"
                tickLine={false}
                axisLine={{ stroke: "var(--color-border)" }}
              />
              <YAxis
                stroke="var(--color-text-dim)"
                fontSize={11}
                fontFamily="var(--font-mono)"
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="count" fill="#22d3ee" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </GlassPanel>
  );
}
