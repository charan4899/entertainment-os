"use client";

import { Bookmark, Eye, Loader2 } from "lucide-react";
import { GlassPanel } from "@/components/common/glass-panel";
import { Poster } from "@/components/common/poster";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BrowseResult } from "@/lib/types";

interface BrowseCardProps {
  item: BrowseResult;
  watchedPending: boolean;
  watchlistPending: boolean;
  onMarkWatched: () => void;
  onAddToWatchlist: () => void;
}

export function BrowseCard({
  item,
  watchedPending,
  watchlistPending,
  onMarkWatched,
  onAddToWatchlist,
}: BrowseCardProps) {
  return (
    <GlassPanel className="flex gap-3 p-3" animate={false}>
      <Poster title={item.title} posterUrl={item.posterUrl} type={item.type} size="md" />
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate text-sm font-medium text-text">{item.title}</p>
        <p className="text-xs text-text-dim">
          {item.year ?? "—"}
          {item.imdbRating > 0 && ` · ${item.imdbRating.toFixed(1)}`}
        </p>

        <div className="mt-auto flex gap-2 pt-2">
          <Button
            size="sm"
            variant="success"
            onClick={onMarkWatched}
            disabled={watchedPending}
            className="flex-1"
            aria-label={`Mark ${item.title} as watched`}
            title="Mark as watched"
          >
            {watchedPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={onAddToWatchlist}
            disabled={watchlistPending || item.inWatchlist}
            className="flex-1"
            aria-label={
              item.inWatchlist ? `${item.title} is already on your watchlist` : `Add ${item.title} to watchlist`
            }
            title={item.inWatchlist ? "Already on your watchlist" : "Add to watchlist"}
          >
            {watchlistPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Bookmark className={cn("h-3.5 w-3.5", item.inWatchlist && "fill-primary text-primary")} />
            )}
          </Button>
        </div>
      </div>
    </GlassPanel>
  );
}
