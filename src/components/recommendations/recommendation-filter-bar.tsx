"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { useLibrary } from "@/lib/store";
import { useDebounce } from "@/hooks/useDebounce";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { MediaType } from "@/lib/types";

const CURRENT_YEAR = new Date().getFullYear();
const EARLIEST_YEAR = 1950;
const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - EARLIEST_YEAR + 1 },
  (_, i) => CURRENT_YEAR - i
);

export function RecommendationFilterBar() {
  const { availableGenres, recommendationFilters, setRecommendationFilters } = useLibrary();

  // Genre chips get their own local, debounced selection so rapid
  // multi-clicking doesn't fire a request per click (each fetch can mean
  // up to 20 TMDb page requests once a filter is active). Type and year
  // are single-choice selects, so they apply immediately on change.
  const [pendingGenres, setPendingGenres] = useState<string[]>(recommendationFilters.genres);
  const debouncedGenres = useDebounce(pendingGenres, 450);
  const [applyingGenres, setApplyingGenres] = useState(false);

  useEffect(() => {
    const sameAsActive =
      debouncedGenres.length === recommendationFilters.genres.length &&
      debouncedGenres.every((g) => recommendationFilters.genres.includes(g));
    if (sameAsActive) return;

    let cancelled = false;
    // Fetch-on-change is the intended use here — `applyingGenres` mirrors
    // the in-flight request, and `cancelled` guards a stale response from
    // clobbering a newer one if the selection changes again mid-request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setApplyingGenres(true);
    setRecommendationFilters({ genres: debouncedGenres }).finally(() => {
      if (!cancelled) setApplyingGenres(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedGenres]);

  function toggleGenre(genre: string) {
    setPendingGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  }

  const hasAnyFilter =
    pendingGenres.length > 0 || recommendationFilters.minYear || recommendationFilters.mediaType !== "all";

  function clearAll() {
    setPendingGenres([]);
    setRecommendationFilters({ genres: [], minYear: null, mediaType: "all" });
  }

  return (
    <div className="mb-5 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          value={recommendationFilters.mediaType}
          onChange={(e) =>
            setRecommendationFilters({ mediaType: e.target.value as "all" | MediaType })
          }
          className="sm:w-40"
        >
          <option value="all">All types</option>
          <option value="movie">Movies</option>
          <option value="series">Series</option>
        </Select>
        <Select
          value={recommendationFilters.minYear ? String(recommendationFilters.minYear) : ""}
          onChange={(e) =>
            setRecommendationFilters({ minYear: e.target.value ? Number(e.target.value) : null })
          }
          className="sm:w-44"
        >
          <option value="">Any year</option>
          {YEAR_OPTIONS.map((year) => (
            <option key={year} value={year}>
              {year} – present
            </option>
          ))}
        </Select>
        {hasAnyFilter && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-text-dim underline underline-offset-2 hover:text-text sm:ml-auto"
          >
            <X className="h-3 w-3" /> Clear all filters
          </button>
        )}
      </div>

      {availableGenres.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <p className="font-mono text-[11px] uppercase tracking-wider text-text-dim">
              Filter by genre
            </p>
            {applyingGenres && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
          </div>
          <div className="flex flex-wrap gap-2">
            {availableGenres.map((genre) => {
              const active = pendingGenres.includes(genre);
              return (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-150",
                    active
                      ? "border-primary/50 bg-primary-soft text-primary-strong"
                      : "border-border bg-white/[0.02] text-text-muted hover:border-border-strong hover:text-text"
                  )}
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
