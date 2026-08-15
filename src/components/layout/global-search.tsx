"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, CornerDownLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { useLibrary } from "@/lib/store";
import { useDebounce } from "@/hooks/useDebounce";
import { Poster } from "@/components/common/poster";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SearchHit {
  id: string;
  title: string;
  meta: string;
  source: "Watched" | "Watchlist" | "Recommendations";
  href: string;
  posterUrl: string | null;
  type: "movie" | "series";
}

export function GlobalSearch() {
  const { watched, watchlist, recommendations } = useLibrary();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(query, 120);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const hits = useMemo<SearchHit[]>(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return [];

    const fromWatched: SearchHit[] = watched
      .filter((w) => w.title.toLowerCase().includes(q))
      .map((w) => ({
        id: w.id,
        title: w.title,
        meta: `${w.year} · ${w.genres[0] ?? ""}`,
        source: "Watched",
        href: "/watched",
        posterUrl: w.posterUrl,
        type: w.type,
      }));

    const fromWatchlist: SearchHit[] = watchlist
      .filter((w) => w.title.toLowerCase().includes(q))
      .map((w) => ({
        id: w.id,
        title: w.title,
        meta: `${w.year} · ${w.genres[0] ?? ""}`,
        source: "Watchlist",
        href: "/watchlist",
        posterUrl: w.posterUrl,
        type: w.type,
      }));

    const fromRecs: SearchHit[] = recommendations
      .filter((r) => r.title.toLowerCase().includes(q))
      .map((r) => ({
        id: `${r.type}-${r.tmdbId}`,
        title: r.title,
        meta: `${r.year} · ${r.genres[0] ?? ""}`,
        source: "Recommendations",
        href: "/recommendations",
        posterUrl: r.posterUrl,
        type: r.type,
      }));

    return [...fromWatched, ...fromWatchlist, ...fromRecs].slice(0, 8);
  }, [debounced, watched, watchlist, recommendations]);

  function handleSelect(hit: SearchHit) {
    setOpen(false);
    setQuery("");
    router.push(hit.href);
  }

  return (
    <div className="relative w-full max-w-xl">
      <div
        className={cn(
          "flex h-11 items-center gap-3 rounded-xl border bg-white/[0.02] px-4 transition-all duration-200",
          open
            ? "border-primary/60 shadow-[0_0_0_3px_var(--color-primary-soft)]"
            : "border-border hover:border-border-strong"
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-text-dim" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder="Query the archive — titles, genres, people..."
          className="h-full flex-1 bg-transparent text-sm text-text placeholder:text-text-dim outline-none"
        />
        {query ? (
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setQuery("")}
            className="text-text-dim transition-colors hover:text-text"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-text-dim sm:block">
            /
          </kbd>
        )}
      </div>

      <AnimatePresence>
        {open && debounced.trim() && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.15 }}
            className="glass-panel absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[60vh] overflow-y-auto rounded-xl p-2"
          >
            {hits.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-text-dim">
                No matches in the archive for &ldquo;{debounced}&rdquo;
              </p>
            ) : (
              hits.map((hit) => (
                <button
                  key={`${hit.source}-${hit.id}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(hit)}
                  className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/[0.04]"
                >
                  <Poster title={hit.title} posterUrl={hit.posterUrl} type={hit.type} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">
                      {hit.title}
                    </p>
                    <p className="truncate text-xs text-text-dim">{hit.meta}</p>
                  </div>
                  <Badge variant="neutral">{hit.source}</Badge>
                  <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-text-dim" />
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
