"use client";

import { CheckCircle2, Plus, Sparkles, X } from "lucide-react";
import { GlassPanel } from "@/components/common/glass-panel";
import { Poster } from "@/components/common/poster";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hashAccent } from "@/lib/utils";
import type { MediaType, RecommendationItem } from "@/lib/types";

const GENRE_BADGE: Record<string, "cyan" | "blue" | "purple" | "green" | "amber"> = {
  cyan: "cyan",
  blue: "blue",
  purple: "purple",
  green: "green",
  amber: "amber",
};

interface RecommendationCardProps {
  item: RecommendationItem;
  onAddToWatchlist: (tmdbId: number, type: MediaType) => void;
  onMarkAsWatched: (tmdbId: number, type: MediaType) => void;
  onIgnore: (tmdbId: number, type: MediaType) => void;
}

export function RecommendationCard({
  item,
  onAddToWatchlist,
  onMarkAsWatched,
  onIgnore,
}: RecommendationCardProps) {
  return (
    <GlassPanel className="flex flex-col gap-4 p-5">
      <div className="flex gap-4">
        <Poster title={item.title} posterUrl={item.posterUrl} type={item.type} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="truncate font-display text-base font-semibold text-text">
                {item.title}
              </p>
              <p className="text-xs text-text-dim">{item.year}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1 rounded-full border border-warning/35 bg-warning-soft px-2 py-0.5">
              <span className="font-mono text-xs font-semibold text-warning">
                {item.imdbRating.toFixed(1)}
              </span>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant="neutral" className="normal-case">
              {item.type === "movie" ? "Movie" : "Series"}
            </Badge>
            {item.genres.slice(0, 2).map((g) => (
              <Badge key={g} variant={GENRE_BADGE[hashAccent(item.title)] ?? "neutral"}>
                {g}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary-soft/60 px-3 py-2">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <p className="text-xs leading-relaxed text-text-muted">{item.reason}</p>
      </div>

      <div className="mt-auto flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="success"
          onClick={() => onMarkAsWatched(item.tmdbId, item.type)}
          className="flex-1"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Watched
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onAddToWatchlist(item.tmdbId, item.type)}
          className="flex-1"
        >
          <Plus className="h-3.5 w-3.5" />
          Watchlist
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onIgnore(item.tmdbId, item.type)}
          aria-label={`Ignore ${item.title}`}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </GlassPanel>
  );
}
