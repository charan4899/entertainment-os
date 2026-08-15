"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useLibrary } from "@/lib/store";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { GlassPanel } from "@/components/common/glass-panel";
import { RecommendationCard } from "./recommendation-card";

export function RecommendationsGrid() {
  const {
    recommendations,
    recommendationsError,
    addRecommendationToWatchlist,
    markRecommendationAsWatched,
    ignoreRecommendation,
  } = useLibrary();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 150);
  const [typeFilter, setTypeFilter] = useState<"all" | "movie" | "series">("all");

  const rows = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return recommendations
      .filter((item) => {
        const matchesQuery = q.length === 0 || item.title.toLowerCase().includes(q);
        const matchesType = typeFilter === "all" || item.type === typeFilter;
        return matchesQuery && matchesType;
      })
      .sort((a, b) => b.imdbRating - a.imdbRating);
  }, [recommendations, debouncedSearch, typeFilter]);

  return (
    <div>
      {recommendationsError ? (
        <GlassPanel className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <Sparkles className="h-6 w-6 text-warning" />
          <p className="max-w-sm text-sm text-text-muted">{recommendationsError}</p>
          <Link
            href="/settings"
            className="text-sm text-primary underline underline-offset-2 hover:text-primary-strong"
          >
            Open Settings
          </Link>
        </GlassPanel>
      ) : (
        <>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dim" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search recommendations..."
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
          </div>

          {rows.length === 0 ? (
            <GlassPanel className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <Sparkles className="h-6 w-6 text-primary" />
              <p className="text-sm text-text-muted">
                {recommendations.length === 0
                  ? "You've worked through every suggestion. Mark titles as watched from here on and future recommendations will be built from your own history."
                  : "No suggestions match this query."}
              </p>
            </GlassPanel>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence initial={false}>
                {rows.map((item) => (
                  <motion.div
                    key={`${item.type}-${item.tmdbId}`}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                  >
                    <RecommendationCard
                      item={item}
                      onAddToWatchlist={addRecommendationToWatchlist}
                      onMarkAsWatched={markRecommendationAsWatched}
                      onIgnore={ignoreRecommendation}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          <p className="mt-5 font-mono text-[11px] uppercase tracking-wider text-text-dim">
            {rows.length} of {recommendations.length} suggestions
          </p>
        </>
      )}
    </div>
  );
}
