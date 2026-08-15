"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, ArrowUpDown, Search, Star } from "lucide-react";
import { useLibrary } from "@/lib/store";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Poster } from "@/components/common/poster";
import { GlassPanel } from "@/components/common/glass-panel";
import { formatDate, cn, hashAccent } from "@/lib/utils";

type SortKey = "title" | "imdbRating" | "year" | "watchedDate";
type SortDirection = "asc" | "desc";

function SortIcon({
  column,
  sortKey,
  sortDir,
}: {
  column: SortKey;
  sortKey: SortKey;
  sortDir: SortDirection;
}) {
  if (sortKey !== column) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
  return sortDir === "asc" ? (
    <ArrowUp className="h-3 w-3 text-primary" />
  ) : (
    <ArrowDown className="h-3 w-3 text-primary" />
  );
}

const GENRE_BADGE_VARIANT: Record<string, "cyan" | "blue" | "purple" | "green" | "amber"> = {
  cyan: "cyan",
  blue: "blue",
  purple: "purple",
  green: "green",
  amber: "amber",
};

function accentToBadge(title: string) {
  return GENRE_BADGE_VARIANT[hashAccent(title)] ?? "neutral";
}

export function WatchedTable() {
  const { watched, toggleFavorite } = useLibrary();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 150);
  const [typeFilter, setTypeFilter] = useState<"all" | "movie" | "series">("all");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("watchedDate");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const genres = useMemo(() => {
    const set = new Set<string>();
    watched.forEach((w) => w.genres.forEach((g) => set.add(g)));
    return ["all", ...Array.from(set).sort()];
  }, [watched]);

  const rows = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    let filtered = watched.filter((item) => {
      const matchesQuery = q.length === 0 || item.title.toLowerCase().includes(q);
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesGenre = genreFilter === "all" || item.genres.includes(genreFilter);
      return matchesQuery && matchesType && matchesGenre;
    });

    filtered = filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "imdbRating":
          comparison = a.imdbRating - b.imdbRating;
          break;
        case "year":
          comparison = a.year - b.year;
          break;
        case "watchedDate":
          comparison = a.watchedDate.localeCompare(b.watchedDate);
          break;
      }
      return sortDir === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [watched, debouncedSearch, typeFilter, genreFilter, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-dim" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search watched titles..."
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
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
          className="sm:w-48"
        >
          {genres.map((g) => (
            <option key={g} value={g}>
              {g === "all" ? "All genres" : g}
            </option>
          ))}
        </Select>
      </div>

      <GlassPanel className="overflow-hidden p-0" animate={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left font-mono text-[11px] uppercase tracking-wider text-text-dim">
                <th className="w-16 px-4 py-3.5 font-medium">Poster</th>
                <th className="px-4 py-3.5 font-medium">
                  <button
                    onClick={() => handleSort("title")}
                    className="flex items-center gap-1.5 transition-colors hover:text-text"
                  >
                    Title <SortIcon column="title" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </th>
                <th className="px-4 py-3.5 font-medium">Type</th>
                <th className="px-4 py-3.5 font-medium">
                  <button
                    onClick={() => handleSort("imdbRating")}
                    className="flex items-center gap-1.5 transition-colors hover:text-text"
                  >
                    IMDb <SortIcon column="imdbRating" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </th>
                <th className="px-4 py-3.5 font-medium">Genre</th>
                <th className="px-4 py-3.5 font-medium">
                  <button
                    onClick={() => handleSort("year")}
                    className="flex items-center gap-1.5 transition-colors hover:text-text"
                  >
                    Year <SortIcon column="year" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </th>
                <th className="px-4 py-3.5 font-medium">
                  <button
                    onClick={() => handleSort("watchedDate")}
                    className="flex items-center gap-1.5 transition-colors hover:text-text"
                  >
                    Watched <SortIcon column="watchedDate" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                </th>
                <th className="px-4 py-3.5 text-center font-medium">Favorite</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item, i) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  className="border-b border-border/60 transition-colors last:border-0 hover:bg-white/[0.025]"
                >
                  <td className="px-4 py-3">
                    <Poster title={item.title} posterUrl={item.posterUrl} type={item.type} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-text">{item.title}</p>
                    {item.director && (
                      <p className="text-xs text-text-dim">{item.director}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="neutral" className="normal-case">
                      {item.type === "movie" ? "Movie" : "Series"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-text">
                      {item.imdbRating.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {item.genres.slice(0, 2).map((g) => (
                        <Badge key={g} variant={accentToBadge(item.title)}>
                          {g}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-text-muted">{item.year}</td>
                  <td className="px-4 py-3 text-text-muted">
                    {formatDate(item.watchedDate)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        aria-label={
                          item.favorite ? "Remove from favorites" : "Mark as favorite"
                        }
                        aria-pressed={item.favorite}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={cn(
                            "h-4 w-4",
                            item.favorite
                              ? "fill-warning text-warning"
                              : "text-text-dim"
                          )}
                        />
                      </button>
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
              No titles match this query. Adjust your filters or search terms.
            </p>
          </div>
        )}
      </GlassPanel>

      <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-text-dim">
        {rows.length} of {watched.length} logged
      </p>
    </div>
  );
}
