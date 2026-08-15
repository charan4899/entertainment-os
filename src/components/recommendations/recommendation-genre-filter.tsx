"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { useLibrary } from "@/lib/store";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

export function RecommendationGenreFilter() {
  const { availableGenres, recommendationGenres, setRecommendationGenres } = useLibrary();

  // Local optimistic selection so chip taps feel instant; the debounced
  // value is what actually triggers the (potentially slow — up to 20 pages
  // of TMDb calls) refetch, so rapid multi-clicking doesn't fire a request
  // per click.
  const [pending, setPending] = useState<string[]>(recommendationGenres);
  const debouncedPending = useDebounce(pending, 450);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const sameAsActive =
      debouncedPending.length === recommendationGenres.length &&
      debouncedPending.every((g) => recommendationGenres.includes(g));
    if (sameAsActive) return;

    let cancelled = false;
    // Fetch-on-change is the intended use here — `applying` mirrors the
    // in-flight request, and `cancelled` guards a stale response from
    // clobbering a newer one if the selection changes again mid-request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setApplying(true);
    setRecommendationGenres(debouncedPending).finally(() => {
      if (!cancelled) setApplying(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPending]);

  function toggle(genre: string) {
    setPending((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  }

  if (availableGenres.length === 0) return null;

  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center gap-2">
        <p className="font-mono text-[11px] uppercase tracking-wider text-text-dim">
          Filter by genre
        </p>
        {applying && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
        {pending.length > 0 && (
          <button
            onClick={() => setPending([])}
            className="ml-auto flex items-center gap-1 text-[11px] text-text-dim underline underline-offset-2 hover:text-text"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {availableGenres.map((genre) => {
          const active = pending.includes(genre);
          return (
            <button
              key={genre}
              onClick={() => toggle(genre)}
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
  );
}
