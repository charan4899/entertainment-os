"use client";

import { useEffect, useState } from "react";
import { Clapperboard, Clock3, Loader2, Tv } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { formatMinutes } from "@/lib/utils";
import type { AnalyticsData } from "@/lib/types";
import { GlassPanel } from "@/components/common/glass-panel";
import { GenreDistributionChart } from "./genre-distribution-chart";
import { YearDistributionChart } from "./year-distribution-chart";
import { TopListPanel } from "./top-list-panel";

function MiniStat({ icon: Icon, label, value }: { icon: typeof Clapperboard; label: string; value: string }) {
  return (
    <GlassPanel className="flex items-center gap-4 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary-soft">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-muted">{label}</p>
        <p className="font-display text-2xl font-semibold text-text">{value}</p>
      </div>
    </GlassPanel>
  );
}

export function AnalyticsView() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getAnalytics()
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load analytics."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <GlassPanel className="flex flex-col items-center gap-3 px-6 py-20 text-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <p className="text-sm text-text-dim">Crunching your watch history...</p>
      </GlassPanel>
    );
  }

  if (error || !data) {
    return (
      <GlassPanel className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <p className="max-w-sm text-sm text-text-muted">{error ?? "Couldn't load analytics."}</p>
      </GlassPanel>
    );
  }

  const hasData = data.moviesWatched + data.seriesWatched > 0;

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <MiniStat icon={Clapperboard} label="Movies Watched" value={String(data.moviesWatched)} />
        <MiniStat icon={Tv} label="Series Watched" value={String(data.seriesWatched)} />
        <MiniStat icon={Clock3} label="Total Watch Time" value={formatMinutes(data.totalWatchMinutes)} />
      </div>

      {!hasData && (
        <GlassPanel className="mt-6 px-6 py-10 text-center">
          <p className="text-sm text-text-muted">
            Mark a few titles as watched and this page fills in with genre
            distribution, release-year spread, and your top genres,
            directors, and actors.
          </p>
        </GlassPanel>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <GenreDistributionChart data={data.genreDistribution} />
        <YearDistributionChart data={data.releaseYearDistribution} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <TopListPanel
          title="Top Genres"
          entries={data.topGenres.map((g) => ({ label: g.genre, count: g.count }))}
          emptyMessage="No genres tracked yet."
        />
        <TopListPanel
          title="Top Directors"
          entries={data.topDirectors.map((d) => ({ label: d.name, count: d.count }))}
          emptyMessage="Director data appears for titles added via TMDb search."
        />
        <TopListPanel
          title="Top Actors"
          entries={data.topActors.map((a) => ({ label: a.name, count: a.count }))}
          emptyMessage="Cast data appears for titles added via TMDb search."
        />
      </div>
    </div>
  );
}
