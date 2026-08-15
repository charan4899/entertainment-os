"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, ApiError } from "./api";
import type {
  ActivityEvent,
  AppSettingsState,
  MediaType,
  Priority,
  RecommendationItem,
  WatchedItem,
  WatchlistItem,
} from "./types";

interface AddWatchlistPayload {
  tmdbId?: number | null;
  title: string;
  type: MediaType;
  imdbRating?: number;
  genres?: string[];
  year?: number;
  runtimeMinutes?: number;
  priority?: Priority;
  posterUrl?: string | null;
  director?: string | null;
  cast?: string[];
}

interface LibraryContextValue {
  watched: WatchedItem[];
  watchlist: WatchlistItem[];
  recommendations: RecommendationItem[];
  activity: ActivityEvent[];
  settings: AppSettingsState | null;
  /** Genre names available to filter recommendations by (union of enabled media types, minus Documentary). */
  availableGenres: string[];
  /** Currently active genre filter — empty means no filter (default cold-start/affinity behavior). */
  recommendationGenres: string[];

  loading: boolean;
  /** Set when the backend itself can't be reached (network/CORS/down). */
  connectionError: string | null;
  /** Set when recommendations specifically can't load (usually: no TMDb key yet). */
  recommendationsError: string | null;

  refreshAll: () => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  removeWatched: (id: string) => Promise<void>;
  removeFromWatchlist: (id: string) => Promise<void>;
  markAsWatched: (id: string) => Promise<void>;
  addToWatchlist: (payload: AddWatchlistPayload) => Promise<void>;
  ignoreRecommendation: (tmdbId: number, type: MediaType) => Promise<void>;
  addRecommendationToWatchlist: (tmdbId: number, type: MediaType) => Promise<void>;
  markRecommendationAsWatched: (tmdbId: number, type: MediaType) => Promise<void>;
  setRecommendationGenres: (genres: string[]) => Promise<void>;
  markTitleAsWatched: (tmdbId: number, type: MediaType) => Promise<void>;
  addBrowseTitleToWatchlist: (tmdbId: number, type: MediaType) => Promise<void>;
  updateSettings: (payload: {
    tmdbApiKey?: string;
    includeMovies?: boolean;
    includeSeries?: boolean;
    minRecommendationRating?: number;
  }) => Promise<void>;
  importLibrary: (data: {
    watched: WatchedItem[];
    watchlist: WatchlistItem[];
  }) => Promise<void>;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

function connectionMessage(err: unknown): string | null {
  if (err instanceof ApiError && err.status === 0) return err.message;
  return null;
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [watched, setWatched] = useState<WatchedItem[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [settings, setSettings] = useState<AppSettingsState | null>(null);
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [recommendationGenres, setRecommendationGenresState] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);

  const refreshWatched = useCallback(async () => {
    setWatched(await api.getWatched());
  }, []);
  const refreshWatchlist = useCallback(async () => {
    setWatchlist(await api.getWatchlist());
  }, []);
  const refreshActivity = useCallback(async () => {
    setActivity(await api.getActivity());
  }, []);
  const refreshSettings = useCallback(async () => {
    setSettings(await api.getSettings());
  }, []);
  const refreshAvailableGenres = useCallback(async () => {
    try {
      setAvailableGenres(await api.getRecommendationGenres());
    } catch {
      // Non-fatal (e.g. no TMDb key yet) — the filter just shows no options.
      setAvailableGenres([]);
    }
  }, []);
  const refreshRecommendations = useCallback(async () => {
    try {
      const data = await api.getRecommendations(recommendationGenres);
      setRecommendations(data);
      setRecommendationsError(null);
    } catch (err) {
      setRecommendations([]);
      setRecommendationsError(err instanceof ApiError ? err.message : "Couldn't load recommendations.");
    }
  }, [recommendationGenres]);

  const setRecommendationGenres = useCallback(async (genres: string[]) => {
    setRecommendationGenresState(genres);
    try {
      const data = await api.getRecommendations(genres);
      setRecommendations(data);
      setRecommendationsError(null);
    } catch (err) {
      setRecommendations([]);
      setRecommendationsError(err instanceof ApiError ? err.message : "Couldn't load recommendations.");
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setConnectionError(null);
    try {
      await Promise.all([
        refreshWatched(),
        refreshWatchlist(),
        refreshActivity(),
        refreshSettings(),
        refreshAvailableGenres(),
      ]);
    } catch (err) {
      const msg = connectionMessage(err);
      setConnectionError(msg ?? (err instanceof ApiError ? err.message : "Something went wrong."));
    }
    await refreshRecommendations();
  }, [
    refreshWatched,
    refreshWatchlist,
    refreshActivity,
    refreshSettings,
    refreshAvailableGenres,
    refreshRecommendations,
  ]);

  useEffect(() => {
    // Initial load on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    refreshAll().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleFavorite = useCallback(
    async (id: string) => {
      const item = watched.find((w) => w.id === id);
      if (!item) return;
      const updated = await api.setFavorite(id, !item.favorite);
      setWatched((prev) => prev.map((w) => (w.id === id ? updated : w)));
      await refreshActivity();
    },
    [watched, refreshActivity]
  );

  const removeWatched = useCallback(
    async (id: string) => {
      await api.deleteWatched(id);
      setWatched((prev) => prev.filter((w) => w.id !== id));
      await refreshActivity();
    },
    [refreshActivity]
  );

  const removeFromWatchlist = useCallback(
    async (id: string) => {
      await api.removeFromWatchlist(id);
      setWatchlist((prev) => prev.filter((w) => w.id !== id));
      await refreshActivity();
    },
    [refreshActivity]
  );

  const markAsWatched = useCallback(
    async (id: string) => {
      const converted = await api.markWatchlistAsWatched(id);
      setWatchlist((prev) => prev.filter((w) => w.id !== id));
      setWatched((prev) => [converted, ...prev]);
      await refreshActivity();
    },
    [refreshActivity]
  );

  const addToWatchlist = useCallback(
    async (payload: AddWatchlistPayload) => {
      const created = await api.createWatchlistItem(payload);
      setWatchlist((prev) => [created, ...prev]);
      await refreshActivity();
    },
    [refreshActivity]
  );

  const ignoreRecommendation = useCallback(
    async (tmdbId: number, type: MediaType) => {
      await api.ignoreRecommendation(tmdbId, type);
      // Refetch rather than just filtering locally — the backend excludes
      // the newly-ignored title automatically, so this naturally backfills
      // the list to full size instead of shrinking it by one.
      await refreshRecommendations();
    },
    [refreshRecommendations]
  );

  const addRecommendationToWatchlist = useCallback(
    async (tmdbId: number, type: MediaType) => {
      const created = await api.recommendationToWatchlist(tmdbId, type);
      setWatchlist((prev) => [created, ...prev]);
      // Refetch rather than filter locally — same fix as ignoreRecommendation:
      // the backend excludes anything already watchlisted, so this naturally
      // backfills the list back to full size instead of shrinking it by one.
      await refreshRecommendations();
      await refreshActivity();
    },
    [refreshRecommendations, refreshActivity]
  );

  const markRecommendationAsWatched = useCallback(
    async (tmdbId: number, type: MediaType) => {
      const created = await api.recommendationToWatched(tmdbId, type);
      setWatched((prev) => [created, ...prev]);
      await refreshRecommendations();
      await refreshActivity();
    },
    [refreshRecommendations, refreshActivity]
  );

  /** Used by the Browse page — logs a title as watched directly, no watchlist detour. */
  const markTitleAsWatched = useCallback(
    async (tmdbId: number, type: MediaType) => {
      const created = await api.markTitleWatched(tmdbId, type);
      setWatched((prev) => [created, ...prev]);
      await refreshActivity();
    },
    [refreshActivity]
  );

  /** Used by the Browse page — queues a title without marking it watched. */
  const addBrowseTitleToWatchlist = useCallback(
    async (tmdbId: number, type: MediaType) => {
      const created = await api.addTitleToWatchlist(tmdbId, type);
      setWatchlist((prev) => [created, ...prev]);
      await refreshActivity();
    },
    [refreshActivity]
  );

  const updateSettings = useCallback(
    async (payload: {
      tmdbApiKey?: string;
      includeMovies?: boolean;
      includeSeries?: boolean;
      minRecommendationRating?: number;
    }) => {
      const updated = await api.updateSettings(payload);
      setSettings(updated);
      // A key change (or preference change) can flip recommendations from
      // erroring to working (or vice versa) — refresh them too.
      await refreshRecommendations();
    },
    [refreshRecommendations]
  );

  const importLibrary = useCallback(
    async (data: { watched: WatchedItem[]; watchlist: WatchlistItem[] }) => {
      for (const item of data.watched) {
        await api.createWatched({
          title: item.title,
          type: item.type,
          imdbRating: item.imdbRating,
          genres: item.genres,
          year: item.year,
          runtimeMinutes: item.runtimeMinutes,
          favorite: item.favorite,
        });
      }
      for (const item of data.watchlist) {
        await api.createWatchlistItem({
          tmdbId: item.tmdbId,
          title: item.title,
          type: item.type,
          imdbRating: item.imdbRating,
          genres: item.genres,
          year: item.year,
          runtimeMinutes: item.runtimeMinutes,
          priority: item.priority,
          posterUrl: item.posterUrl,
        });
      }
      await Promise.all([refreshWatched(), refreshWatchlist(), refreshActivity()]);
    },
    [refreshWatched, refreshWatchlist, refreshActivity]
  );

  const value = useMemo<LibraryContextValue>(
    () => ({
      watched,
      watchlist,
      recommendations,
      activity,
      settings,
      availableGenres,
      recommendationGenres,
      loading,
      connectionError,
      recommendationsError,
      refreshAll,
      toggleFavorite,
      removeWatched,
      removeFromWatchlist,
      markAsWatched,
      addToWatchlist,
      ignoreRecommendation,
      addRecommendationToWatchlist,
      markRecommendationAsWatched,
      setRecommendationGenres,
      markTitleAsWatched,
      addBrowseTitleToWatchlist,
      updateSettings,
      importLibrary,
    }),
    [
      watched,
      watchlist,
      recommendations,
      activity,
      settings,
      availableGenres,
      recommendationGenres,
      loading,
      connectionError,
      recommendationsError,
      refreshAll,
      toggleFavorite,
      removeWatched,
      removeFromWatchlist,
      markAsWatched,
      addToWatchlist,
      ignoreRecommendation,
      addRecommendationToWatchlist,
      markRecommendationAsWatched,
      setRecommendationGenres,
      markTitleAsWatched,
      addBrowseTitleToWatchlist,
      updateSettings,
      importLibrary,
    ]
  );

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error("useLibrary must be used within a LibraryProvider");
  }
  return ctx;
}
