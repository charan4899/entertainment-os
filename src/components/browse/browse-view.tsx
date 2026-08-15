"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import { useLibrary } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/common/glass-panel";
import { BrowseCard } from "./browse-card";
import type { BrowseResult, MediaType } from "@/lib/types";

export function BrowseView() {
  const { markTitleAsWatched, addBrowseTitleToWatchlist } = useLibrary();

  const [type, setType] = useState<MediaType>("movie");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [page, setPage] = useState(1);

  const [results, setResults] = useState<BrowseResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchedPendingId, setWatchedPendingId] = useState<number | null>(null);
  const [watchlistPendingId, setWatchlistPendingId] = useState<number | null>(null);

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  function handleTypeChange(value: MediaType) {
    setType(value);
    setPage(1);
  }

  useEffect(() => {
    let cancelled = false;
    // Fetch-on-change is the intended use here — loading/error state mirrors
    // the in-flight request, and `cancelled` guards against a stale response
    // clobbering a newer one if type/query/page change again mid-request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    api
      .browse({ type, query: debouncedQuery || undefined, page })
      .then((data) => {
        if (!cancelled) setResults(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setResults([]);
          setError(err instanceof ApiError ? err.message : "Couldn't load titles.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [type, debouncedQuery, page]);

  async function handleMarkWatched(item: BrowseResult) {
    setWatchedPendingId(item.tmdbId);
    try {
      await markTitleAsWatched(item.tmdbId, item.type);
      // Marked-watched titles have nothing left to do here — drop them
      // from the grid instead of just flagging them.
      setResults((prev) => prev.filter((r) => r.tmdbId !== item.tmdbId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't mark that as watched.");
    } finally {
      setWatchedPendingId(null);
    }
  }

  async function handleAddToWatchlist(item: BrowseResult) {
    setWatchlistPendingId(item.tmdbId);
    try {
      await addBrowseTitleToWatchlist(item.tmdbId, item.type);
      setResults((prev) =>
        prev.map((r) => (r.tmdbId === item.tmdbId ? { ...r, inWatchlist: true } : r))
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't add that to your watchlist.");
    } finally {
      setWatchlistPendingId(null);
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dim" />
          <Input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search for a title not in the popular list..."
            className="pl-10"
          />
        </div>
        <Select value={type} onChange={(e) => handleTypeChange(e.target.value as MediaType)} className="sm:w-40">
          <option value="movie">Movies</option>
          <option value="series">Series</option>
        </Select>
      </div>

      {error && (
        <GlassPanel className="mb-5 px-5 py-4">
          <p className="text-sm text-danger">{error}</p>
        </GlassPanel>
      )}

      {loading ? (
        <GlassPanel className="flex flex-col items-center gap-3 px-6 py-20 text-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <p className="text-sm text-text-dim">
            {debouncedQuery ? "Searching TMDb..." : "Loading popular titles..."}
          </p>
        </GlassPanel>
      ) : results.length === 0 ? (
        <GlassPanel className="px-6 py-16 text-center">
          <p className="text-sm text-text-muted">No titles found.</p>
        </GlassPanel>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence initial={false}>
            {results.map((item) => (
              <motion.div
                key={`${item.type}-${item.tmdbId}`}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.18 }}
              >
                <BrowseCard
                  item={item}
                  watchedPending={watchedPendingId === item.tmdbId}
                  watchlistPending={watchlistPendingId === item.tmdbId}
                  onMarkWatched={() => handleMarkWatched(item)}
                  onAddToWatchlist={() => handleAddToWatchlist(item)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!debouncedQuery && !loading && results.length > 0 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="font-mono text-xs text-text-dim">Page {page}</span>
          <Button variant="secondary" onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
