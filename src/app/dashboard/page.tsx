"use client";

import { Clapperboard, Clock3, ListVideo, Tv } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { StatPanel } from "@/components/dashboard/stat-panel";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { GenreSignal } from "@/components/dashboard/genre-signal";
import { useLibrary } from "@/lib/store";

// Series watch-time is estimated at ~10 episodes per tracked season — Phase 1
// has no TMDb episode data yet, so this is a stated approximation.
const ASSUMED_EPISODES_PER_SEASON = 10;

export default function DashboardPage() {
  const { watched, watchlist, activity } = useLibrary();

  const moviesWatched = watched.filter((w) => w.type === "movie").length;
  const seriesWatched = watched.filter((w) => w.type === "series").length;

  const totalMinutes = watched.reduce((sum, item) => {
    if (item.type === "movie") return sum + item.runtimeMinutes;
    const episodes = (item.seasonsWatched ?? 1) * ASSUMED_EPISODES_PER_SEASON;
    return sum + item.runtimeMinutes * episodes;
  }, 0);
  const totalHours = Math.round(totalMinutes / 60);

  return (
    <div>
      <PageHeader
        eyebrow="System Overview"
        title="Welcome back to your archive"
        description="A live readout of what you've tracked, what's queued, and what the engine noticed."
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatPanel
          icon={Clapperboard}
          label="Movies Watched"
          value={moviesWatched}
          detail="Feature-length titles logged"
          accent="cyan"
          pulse={[0.5, 0.8, 0.4, 0.9, 0.6, 0.7, 0.5]}
        />
        <StatPanel
          icon={Tv}
          label="Series Watched"
          value={seriesWatched}
          detail="Shows with at least one season logged"
          accent="blue"
          pulse={[0.6, 0.4, 0.8, 0.5, 0.9, 0.4, 0.7]}
        />
        <StatPanel
          icon={ListVideo}
          label="Watchlist Count"
          value={watchlist.length}
          detail="Queued for the next session"
          accent="purple"
          pulse={[0.3, 0.6, 0.7, 0.4, 0.5, 0.8, 0.6]}
        />
        <StatPanel
          icon={Clock3}
          label="Total Watch Time"
          value={totalHours}
          suffix="hrs"
          detail={`≈ ${totalMinutes.toLocaleString()} minutes of tracked runtime`}
          accent="green"
          pulse={[0.7, 0.5, 0.6, 0.9, 0.4, 0.6, 0.8]}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ActivityFeed events={activity} />
        </div>
        <GenreSignal watched={watched} />
      </div>
    </div>
  );
}
