"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Search } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import { useLibrary } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Poster } from "@/components/common/poster";
import type { MediaType, Priority, SearchResult } from "@/lib/types";

interface AddWatchlistFormProps {
  onDone: () => void;
}

export function AddWatchlistForm({ onDone }: AddWatchlistFormProps) {
  const [mode, setMode] = useState<"search" | "manual">("search");

  return (
    <div>
      {mode === "search" ? (
        <SearchMode onDone={onDone} onSwitchToManual={() => setMode("manual")} />
      ) : (
        <ManualMode onDone={onDone} onSwitchToSearch={() => setMode("search")} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Search mode
// ---------------------------------------------------------------------------

function SearchMode({
  onDone,
  onSwitchToManual,
}: {
  onDone: () => void;
  onSwitchToManual: () => void;
}) {
  const { addToWatchlist } = useLibrary();
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 250);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [priority, setPriority] = useState<Priority>("medium");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!debounced.trim()) {
      // Clearing the query resets search state — not a data sync, just
      // mirroring the input back to empty.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      setSearchError(null);
      return;
    }
    let cancelled = false;
    setSearching(true);
    setSearchError(null);
    api
      .search(debounced)
      .then((data) => {
        if (!cancelled) setResults(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setResults([]);
          setSearchError(err instanceof ApiError ? err.message : "Search failed.");
        }
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  async function handleAdd() {
    if (!selected) return;
    setAdding(true);
    try {
      const details = await api.getDetails(selected.type, selected.tmdbId);
      await addToWatchlist({
        tmdbId: selected.tmdbId,
        title: selected.title,
        type: selected.type,
        imdbRating: details.imdb_rating,
        genres: details.genres,
        year: details.year || selected.year || new Date().getFullYear(),
        runtimeMinutes: details.runtime_minutes,
        priority,
        posterUrl: details.poster_path ?? selected.posterUrl,
        director: details.director,
        cast: details.cast,
      });
      onDone();
    } catch (err) {
      setSearchError(err instanceof ApiError ? err.message : "Couldn't add that title.");
    } finally {
      setAdding(false);
    }
  }

  if (selected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-white/[0.02] p-3">
          <Poster title={selected.title} posterUrl={selected.posterUrl} type={selected.type} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text">{selected.title}</p>
            <p className="text-xs text-text-dim">
              {selected.year ?? "—"} · {selected.type === "movie" ? "Movie" : "Series"}
              {selected.imdbRating > 0 && ` · ${selected.imdbRating.toFixed(1)}`}
            </p>
          </div>
          <button
            onClick={() => setSelected(null)}
            className="text-xs text-text-dim underline underline-offset-2 hover:text-text"
          >
            Change
          </button>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">Priority</label>
          <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
        </div>

        {searchError && <p className="text-xs text-danger">{searchError}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={handleAdd} disabled={adding}>
            {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Add to Watchlist
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dim" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search TMDb — title..."
          className="pl-10"
          autoFocus
        />
      </div>

      {searchError && (
        <p className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger">
          {searchError}
        </p>
      )}

      {searching && (
        <p className="flex items-center gap-2 text-xs text-text-dim">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching TMDb...
        </p>
      )}

      {!searching && results.length > 0 && (
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {results.map((r) => (
            <button
              key={`${r.type}-${r.tmdbId}`}
              onClick={() => setSelected(r)}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/[0.04]"
            >
              <Poster title={r.title} posterUrl={r.posterUrl} type={r.type} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text">{r.title}</p>
                <p className="text-xs text-text-dim">
                  {r.year ?? "—"} · {r.type === "movie" ? "Movie" : "Series"}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {!searching && debounced.trim() && results.length === 0 && !searchError && (
        <p className="py-4 text-center text-sm text-text-dim">No matches on TMDb.</p>
      )}

      <div className="flex items-center justify-between border-t border-border pt-3">
        <button
          onClick={onSwitchToManual}
          className="text-xs text-text-dim underline underline-offset-2 hover:text-text"
        >
          Can&rsquo;t find it — add manually
        </button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Manual mode (no TMDb id — used when search can't find a title, or no
// TMDb key is configured yet)
// ---------------------------------------------------------------------------

function ManualMode({
  onDone,
  onSwitchToSearch,
}: {
  onDone: () => void;
  onSwitchToSearch: () => void;
}) {
  const { addToWatchlist } = useLibrary();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<MediaType>("movie");
  const [year, setYear] = useState("");
  const [genre, setGenre] = useState("");
  const [rating, setRating] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await addToWatchlist({
        title: title.trim(),
        type,
        year: Number(year) || new Date().getFullYear(),
        genres: genre.trim() ? genre.split(",").map((g) => g.trim()) : [],
        imdbRating: rating ? Math.min(10, Math.max(0, Number(rating))) : 0,
        runtimeMinutes: type === "movie" ? 120 : 45,
        priority,
      });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't add that title.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-text-muted">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. The Bear"
          autoFocus
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">Type</label>
          <Select value={type} onChange={(e) => setType(e.target.value as MediaType)}>
            <option value="movie">Movie</option>
            <option value="series">Series</option>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">Year</label>
          <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="2026" inputMode="numeric" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">Genre(s)</label>
          <Input value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Sci-Fi, Drama" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">IMDb Rating</label>
          <Input value={rating} onChange={(e) => setRating(e.target.value)} placeholder="8.2" inputMode="decimal" />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-text-muted">Priority</label>
        <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Select>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}

      <div className="flex items-center justify-between border-t border-border pt-3">
        <button
          type="button"
          onClick={onSwitchToSearch}
          className="text-xs text-text-dim underline underline-offset-2 hover:text-text"
        >
          Search TMDb instead
        </button>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Add to Watchlist
          </Button>
        </div>
      </div>
    </form>
  );
}
