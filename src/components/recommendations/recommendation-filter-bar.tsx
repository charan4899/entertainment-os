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

interface ChipOption {
  value: string;
  label: string;
}

/** A debounced multi-select chip picker. Local `pending` selection updates
 * instantly on click; the actual (potentially slow — up to 20 TMDb pages
 * once active) fetch only fires after the selection settles, so rapid
 * multi-clicking doesn't fire a request per click. */
function ChipFilterGroup({
  title,
  options,
  active,
  onApply,
}: {
  title: string;
  options: ChipOption[];
  active: string[];
  onApply: (values: string[]) => Promise<void>;
}) {
  const [pending, setPending] = useState<string[]>(active);
  const debounced = useDebounce(pending, 450);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const sameAsActive =
      debounced.length === active.length && debounced.every((v) => active.includes(v));
    if (sameAsActive) return;

    let cancelled = false;
    // Fetch-on-change is the intended use here — `applying` mirrors the
    // in-flight request, and `cancelled` guards a stale response from
    // clobbering a newer one if the selection changes again mid-request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setApplying(true);
    onApply(debounced).finally(() => {
      if (!cancelled) setApplying(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  function toggle(value: string) {
    setPending((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  if (options.length === 0) return null;

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <p className="font-mono text-[11px] uppercase tracking-wider text-text-dim">{title}</p>
        {applying && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isActive = pending.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => toggle(opt.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-150",
                isActive
                  ? "border-primary/50 bg-primary-soft text-primary-strong"
                  : "border-border bg-white/[0.02] text-text-muted hover:border-border-strong hover:text-text"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function RecommendationFilterBar() {
  const { availableGenres, availableOriginCountries, recommendationFilters, setRecommendationFilters } =
    useLibrary();

  // Bumped on "Clear all" to force both chip groups to remount and re-sync
  // their local pending selection from the (now-cleared) store state.
  const [resetKey, setResetKey] = useState(0);

  const hasAnyFilter =
    recommendationFilters.genres.length > 0 ||
    recommendationFilters.originCountries.length > 0 ||
    recommendationFilters.minYear !== null ||
    recommendationFilters.mediaType !== "all";

  function clearAll() {
    setRecommendationFilters({ genres: [], originCountries: [], minYear: null, mediaType: "all" });
    setResetKey((k) => k + 1);
  }

  const genreOptions: ChipOption[] = availableGenres.map((g) => ({ value: g, label: g }));
  const originOptions: ChipOption[] = availableOriginCountries.map((c) => ({
    value: c.code,
    label: c.label,
  }));

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

      <ChipFilterGroup
        key={`genre-${resetKey}`}
        title="Filter by genre"
        options={genreOptions}
        active={recommendationFilters.genres}
        onApply={(genres) => setRecommendationFilters({ genres })}
      />

      <ChipFilterGroup
        key={`origin-${resetKey}`}
        title="Filter by origin country"
        options={originOptions}
        active={recommendationFilters.originCountries}
        onApply={(originCountries) => setRecommendationFilters({ originCountries })}
      />
    </div>
  );
}
