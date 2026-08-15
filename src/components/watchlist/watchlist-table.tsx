"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Plus, Search, Trash2 } from "lucide-react";
import { useLibrary } from "@/lib/store";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Poster } from "@/components/common/poster";
import { GlassPanel } from "@/components/common/glass-panel";
import { AddWatchlistForm } from "./add-watchlist-form";
import { formatDate, hashAccent } from "@/lib/utils";
import type { WatchlistItem } from "@/lib/types";

const PRIORITY_BADGE: Record<WatchlistItem["priority"], "danger" | "amber" | "neutral"> = {
  high: "danger",
  medium: "amber",
  low: "neutral",
};

const GENRE_BADGE: Record<string, "cyan" | "blue" | "purple" | "green" | "amber"> = {
  cyan: "cyan",
  blue: "blue",
  purple: "purple",
  green: "green",
  amber: "amber",
};

export function WatchlistTable() {
  const { watchlist, removeFromWatchlist, markAsWatched } = useLibrary();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 150);
  const [typeFilter, setTypeFilter] = useState<"all" | "movie" | "series">("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | WatchlistItem["priority"]>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return watchlist
      .filter((item) => {
        const matchesQuery = q.length === 0 || item.title.toLowerCase().includes(q);
        const matchesType = typeFilter === "all" || item.type === typeFilter;
        const matchesPriority = priorityFilter === "all" || item.priority === priorityFilter;
        return matchesQuery && matchesType && matchesPriority;
      })
      .sort((a, b) => b.addedDate.localeCompare(a.addedDate));
  }, [watchlist, debouncedSearch, typeFilter, priorityFilter]);

  const pendingRemove = watchlist.find((w) => w.id === pendingRemoveId) ?? null;

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dim" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search watchlist..."
            className="pl-10"
          />
        </div>
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          className="sm:w-40"
        >
          <option value="all">All types</option>
          <option value="movie">Movies</option>
          <option value="series">Series</option>
        </Select>
        <Select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
          className="sm:w-40"
        >
          <option value="all">All priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Select>
        <Button variant="primary" onClick={() => setAddOpen(true)} className="sm:w-auto">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      <GlassPanel className="overflow-hidden p-0" animate={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left font-mono text-[11px] uppercase tracking-wider text-text-dim">
                <th className="w-16 px-4 py-3.5 font-medium">Poster</th>
                <th className="px-4 py-3.5 font-medium">Title</th>
                <th className="px-4 py-3.5 font-medium">Type</th>
                <th className="px-4 py-3.5 font-medium">IMDb</th>
                <th className="px-4 py-3.5 font-medium">Genre</th>
                <th className="px-4 py-3.5 font-medium">Priority</th>
                <th className="px-4 py-3.5 font-medium">Added</th>
                <th className="px-4 py-3.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item, i) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  className="border-b border-border/60 transition-colors last:border-0 hover:bg-white/[0.025]"
                >
                  <td className="px-4 py-3">
                    <Poster title={item.title} posterUrl={item.posterUrl} type={item.type} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-text">{item.title}</p>
                    <p className="text-xs text-text-dim">{item.year}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="neutral" className="normal-case">
                      {item.type === "movie" ? "Movie" : "Series"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-text">
                    {item.imdbRating > 0 ? item.imdbRating.toFixed(1) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {item.genres.slice(0, 2).map((g) => (
                        <Badge key={g} variant={GENRE_BADGE[hashAccent(item.title)] ?? "neutral"}>
                          {g}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={PRIORITY_BADGE[item.priority]} className="normal-case">
                      {item.priority}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{formatDate(item.addedDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => markAsWatched(item.id)}
                        className="whitespace-nowrap"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Mark Watched
                      </Button>
                      <Button
                        size="icon"
                        variant="danger"
                        onClick={() => setPendingRemoveId(item.id)}
                        aria-label={`Remove ${item.title} from watchlist`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-text-muted">
              {watchlist.length === 0
                ? "Your watchlist is empty. Add a title to start queuing what's next."
                : "No titles match this query. Adjust your filters or search terms."}
            </p>
          </div>
        )}
      </GlassPanel>

      <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-text-dim">
        {rows.length} of {watchlist.length} queued
      </p>

      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add to Watchlist"
        description="Search TMDb, or add a title manually if it's not listed."
      >
        <AddWatchlistForm onDone={() => setAddOpen(false)} />
      </Dialog>

      <Dialog
        open={!!pendingRemove}
        onClose={() => setPendingRemoveId(null)}
        title="Remove from watchlist?"
        description={
          pendingRemove
            ? `"${pendingRemove.title}" will be removed. This can't be undone.`
            : undefined
        }
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => setPendingRemoveId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (pendingRemoveId) removeFromWatchlist(pendingRemoveId);
              setPendingRemoveId(null);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
