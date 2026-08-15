"use client";

import { Check, Loader2 } from "lucide-react";
import { GlassPanel } from "@/components/common/glass-panel";
import { Poster } from "@/components/common/poster";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BrowseResult } from "@/lib/types";

interface BrowseCardProps {
  item: BrowseResult;
  pending: boolean;
  onMarkWatched: () => void;
}

export function BrowseCard({ item, pending, onMarkWatched }: BrowseCardProps) {
  return (
    <GlassPanel className="flex gap-3 p-3" animate={false}>
      <Poster title={item.title} posterUrl={item.posterUrl} type={item.type} size="md" />
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate text-sm font-medium text-text">{item.title}</p>
        <p className="text-xs text-text-dim">
          {item.year ?? "—"}
          {item.imdbRating > 0 && ` · ${item.imdbRating.toFixed(1)}`}
        </p>

        <div className="mt-auto pt-2">
          {item.alreadyWatched ? (
            <Badge variant="green" className="normal-case">
              <Check className="h-3 w-3" /> Watched
            </Badge>
          ) : (
            <Button size="sm" variant="success" onClick={onMarkWatched} disabled={pending} className="w-full">
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Watched
            </Button>
          )}
          {item.inWatchlist && !item.alreadyWatched && (
            <p className="mt-1.5 text-center text-[11px] text-text-dim">Already on your watchlist</p>
          )}
        </div>
      </div>
    </GlassPanel>
  );
}
