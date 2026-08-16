import type {
  ActivityEvent,
  AnalyticsData,
  AppSettingsState,
  BrowseResult,
  MediaType,
  NotificationItem,
  OriginCountryOption,
  Priority,
  RecommendationFilters,
  RecommendationItem,
  SearchResult,
  WatchedItem,
  WatchlistItem,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError(
      `Couldn't reach the API at ${API_BASE}. Is the backend running?`,
      0
    );
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // response wasn't JSON — fall back to statusText
    }
    throw new ApiError(detail, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---------------------------------------------------------------------------
// Wire <-> app mapping
// ---------------------------------------------------------------------------

interface WatchedWire {
  id: string;
  tmdb_id: number | null;
  title: string;
  media_type: MediaType;
  imdb_rating: number;
  genres: string[];
  year: number;
  watched_date: string;
  favorite: boolean;
  runtime_minutes: number;
  seasons_watched: number | null;
  poster_path: string | null;
  director: string | null;
  cast: string[];
}

function fromWatchedWire(w: WatchedWire): WatchedItem {
  return {
    id: w.id,
    tmdbId: w.tmdb_id,
    title: w.title,
    type: w.media_type,
    imdbRating: w.imdb_rating,
    genres: w.genres,
    year: w.year,
    watchedDate: w.watched_date,
    favorite: w.favorite,
    runtimeMinutes: w.runtime_minutes,
    seasonsWatched: w.seasons_watched,
    posterUrl: w.poster_path,
    director: w.director,
    cast: w.cast,
  };
}

interface WatchlistWire {
  id: string;
  tmdb_id: number | null;
  title: string;
  media_type: MediaType;
  imdb_rating: number;
  genres: string[];
  year: number;
  added_date: string;
  runtime_minutes: number;
  poster_path: string | null;
  priority: Priority;
  director: string | null;
  cast: string[];
}

function fromWatchlistWire(w: WatchlistWire): WatchlistItem {
  return {
    id: w.id,
    tmdbId: w.tmdb_id,
    title: w.title,
    type: w.media_type,
    imdbRating: w.imdb_rating,
    genres: w.genres,
    year: w.year,
    addedDate: w.added_date,
    runtimeMinutes: w.runtime_minutes,
    posterUrl: w.poster_path,
    priority: w.priority,
    director: w.director,
    cast: w.cast,
  };
}

interface RecommendationWire {
  tmdb_id: number;
  title: string;
  media_type: MediaType;
  imdb_rating: number;
  genres: string[];
  year: number;
  reason: string;
  match_score: number;
  poster_path: string | null;
}

function fromRecommendationWire(r: RecommendationWire): RecommendationItem {
  return {
    tmdbId: r.tmdb_id,
    title: r.title,
    type: r.media_type,
    imdbRating: r.imdb_rating,
    genres: r.genres,
    year: r.year,
    reason: r.reason,
    matchScore: r.match_score,
    posterUrl: r.poster_path,
  };
}

interface ActivityWire {
  id: string;
  label: string;
  detail: string;
  kind: ActivityEvent["kind"];
  timestamp: string;
}

function fromActivityWire(a: ActivityWire): ActivityEvent {
  return { id: a.id, label: a.label, detail: a.detail, kind: a.kind, timestamp: a.timestamp };
}

interface SettingsWire {
  tmdb_api_key_set: boolean;
  include_movies: boolean;
  include_series: boolean;
  min_recommendation_rating: number;
}

function fromSettingsWire(s: SettingsWire): AppSettingsState {
  return {
    tmdbApiKeySet: s.tmdb_api_key_set,
    includeMovies: s.include_movies,
    includeSeries: s.include_series,
    minRecommendationRating: s.min_recommendation_rating,
  };
}

interface SearchResultWire {
  tmdb_id: number;
  title: string;
  media_type: MediaType;
  year: number | null;
  poster_path: string | null;
  imdb_rating: number;
}

function fromSearchResultWire(s: SearchResultWire): SearchResult {
  return {
    tmdbId: s.tmdb_id,
    title: s.title,
    type: s.media_type,
    year: s.year,
    posterUrl: s.poster_path,
    imdbRating: s.imdb_rating,
  };
}

interface AnalyticsWire {
  movies_watched: number;
  series_watched: number;
  total_watch_minutes: number;
  genre_distribution: { genre: string; count: number }[];
  release_year_distribution: { year: number; count: number }[];
  top_genres: { genre: string; count: number }[];
  top_directors: { name: string; count: number }[];
  top_actors: { name: string; count: number }[];
}

function fromAnalyticsWire(a: AnalyticsWire): AnalyticsData {
  return {
    moviesWatched: a.movies_watched,
    seriesWatched: a.series_watched,
    totalWatchMinutes: a.total_watch_minutes,
    genreDistribution: a.genre_distribution,
    releaseYearDistribution: a.release_year_distribution,
    topGenres: a.top_genres,
    topDirectors: a.top_directors,
    topActors: a.top_actors,
  };
}

interface NotificationWire {
  series_title: string;
  tmdb_id: number;
  kind: NotificationItem["kind"];
  message: string;
  season_number: number | null;
}

function fromNotificationWire(n: NotificationWire): NotificationItem {
  return {
    seriesTitle: n.series_title,
    tmdbId: n.tmdb_id,
    kind: n.kind,
    message: n.message,
    seasonNumber: n.season_number,
  };
}

interface BackfillSeasonsItemWire {
  title: string;
  previous_seasons_watched: number | null;
  new_seasons_watched: number;
}

interface BackfillSeasonsResultWire {
  updated: BackfillSeasonsItemWire[];
  unchanged_count: number;
  skipped_count: number;
}

export interface BackfillSeasonsItem {
  title: string;
  previousSeasonsWatched: number | null;
  newSeasonsWatched: number;
}

export interface BackfillSeasonsResult {
  updated: BackfillSeasonsItem[];
  unchangedCount: number;
  skippedCount: number;
}

function fromBackfillSeasonsWire(b: BackfillSeasonsResultWire): BackfillSeasonsResult {
  return {
    updated: b.updated.map((u) => ({
      title: u.title,
      previousSeasonsWatched: u.previous_seasons_watched,
      newSeasonsWatched: u.new_seasons_watched,
    })),
    unchangedCount: b.unchanged_count,
    skippedCount: b.skipped_count,
  };
}

interface BrowseResultWire {
  tmdb_id: number;
  title: string;
  media_type: MediaType;
  year: number | null;
  poster_path: string | null;
  imdb_rating: number;
  already_watched: boolean;
  in_watchlist: boolean;
}

function fromBrowseResultWire(b: BrowseResultWire): BrowseResult {
  return {
    tmdbId: b.tmdb_id,
    title: b.title,
    type: b.media_type,
    year: b.year,
    posterUrl: b.poster_path,
    imdbRating: b.imdb_rating,
    alreadyWatched: b.already_watched,
    inWatchlist: b.in_watchlist,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const api = {
  // Watched
  async getWatched(): Promise<WatchedItem[]> {
    const data = await request<WatchedWire[]>("/api/watched");
    return data.map(fromWatchedWire);
  },
  async createWatched(payload: {
    title: string;
    type: MediaType;
    imdbRating?: number;
    genres?: string[];
    year?: number;
    runtimeMinutes?: number;
    favorite?: boolean;
  }): Promise<WatchedItem> {
    const data = await request<WatchedWire>("/api/watched", {
      method: "POST",
      body: JSON.stringify({
        title: payload.title,
        media_type: payload.type,
        imdb_rating: payload.imdbRating ?? 0,
        genres: payload.genres ?? [],
        year: payload.year ?? 0,
        runtime_minutes: payload.runtimeMinutes ?? 0,
        favorite: payload.favorite ?? false,
      }),
    });
    return fromWatchedWire(data);
  },
  async setFavorite(id: string, favorite: boolean): Promise<WatchedItem> {
    const data = await request<WatchedWire>(`/api/watched/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ favorite }),
    });
    return fromWatchedWire(data);
  },
  async deleteWatched(id: string): Promise<void> {
    await request<void>(`/api/watched/${id}`, { method: "DELETE" });
  },
  /** One-off maintenance action — see Settings. Safe to call more than once. */
  async backfillSeasons(): Promise<BackfillSeasonsResult> {
    const data = await request<BackfillSeasonsResultWire>("/api/watched/backfill-seasons", {
      method: "POST",
    });
    return fromBackfillSeasonsWire(data);
  },

  // Watchlist
  async getWatchlist(): Promise<WatchlistItem[]> {
    const data = await request<WatchlistWire[]>("/api/watchlist");
    return data.map(fromWatchlistWire);
  },
  async createWatchlistItem(payload: {
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
  }): Promise<WatchlistItem> {
    const data = await request<WatchlistWire>("/api/watchlist", {
      method: "POST",
      body: JSON.stringify({
        tmdb_id: payload.tmdbId ?? null,
        title: payload.title,
        media_type: payload.type,
        imdb_rating: payload.imdbRating ?? 0,
        genres: payload.genres ?? [],
        year: payload.year ?? 0,
        runtime_minutes: payload.runtimeMinutes ?? 0,
        priority: payload.priority ?? "medium",
        poster_path: payload.posterUrl ?? null,
        director: payload.director ?? null,
        cast: payload.cast ?? [],
      }),
    });
    return fromWatchlistWire(data);
  },
  async removeFromWatchlist(id: string): Promise<void> {
    await request<void>(`/api/watchlist/${id}`, { method: "DELETE" });
  },
  async markWatchlistAsWatched(id: string): Promise<WatchedItem> {
    const data = await request<WatchedWire>(`/api/watchlist/${id}/mark-watched`, {
      method: "POST",
    });
    return fromWatchedWire(data);
  },

  // Recommendations
  async getRecommendations(filters?: RecommendationFilters): Promise<RecommendationItem[]> {
    const params = new URLSearchParams();
    if (filters?.genres && filters.genres.length > 0) params.set("genres", filters.genres.join(","));
    if (filters?.minYear) params.set("min_year", String(filters.minYear));
    if (filters?.mediaType && filters.mediaType !== "all") params.set("media_type", filters.mediaType);
    if (filters?.originCountries && filters.originCountries.length > 0)
      params.set("origin", filters.originCountries.join(","));
    const qs = params.toString();
    const data = await request<RecommendationWire[]>(`/api/recommendations${qs ? `?${qs}` : ""}`);
    return data.map(fromRecommendationWire);
  },
  async getRecommendationGenres(): Promise<string[]> {
    return request<string[]>("/api/recommendations/genres");
  },
  async getRecommendationOrigins(): Promise<OriginCountryOption[]> {
    return request<OriginCountryOption[]>("/api/recommendations/origins");
  },
  async ignoreRecommendation(tmdbId: number, type: MediaType): Promise<void> {
    await request<void>(`/api/recommendations/${tmdbId}/ignore?media_type=${type}`, {
      method: "POST",
    });
  },
  async recommendationToWatchlist(tmdbId: number, type: MediaType): Promise<WatchlistItem> {
    const data = await request<WatchlistWire>(
      `/api/recommendations/${tmdbId}/watchlist?media_type=${type}`,
      { method: "POST" }
    );
    return fromWatchlistWire(data);
  },
  async recommendationToWatched(tmdbId: number, type: MediaType): Promise<WatchedItem> {
    const data = await request<WatchedWire>(
      `/api/recommendations/${tmdbId}/watched?media_type=${type}`,
      { method: "POST" }
    );
    return fromWatchedWire(data);
  },

  // Search
  async search(query: string): Promise<SearchResult[]> {
    if (!query.trim()) return [];
    const data = await request<SearchResultWire[]>(
      `/api/search?q=${encodeURIComponent(query)}`
    );
    return data.map(fromSearchResultWire);
  },
  async getDetails(type: MediaType, tmdbId: number) {
    return request<{
      genres: string[];
      runtime_minutes: number;
      director: string | null;
      cast: string[];
      poster_path: string | null;
      imdb_rating: number;
      year: number;
    }>(`/api/search/details/${type}/${tmdbId}`);
  },

  // Activity
  async getActivity(): Promise<ActivityEvent[]> {
    const data = await request<ActivityWire[]>("/api/activity");
    return data.map(fromActivityWire);
  },

  // Settings
  async getSettings(): Promise<AppSettingsState> {
    const data = await request<SettingsWire>("/api/settings");
    return fromSettingsWire(data);
  },
  async updateSettings(payload: {
    tmdbApiKey?: string;
    includeMovies?: boolean;
    includeSeries?: boolean;
    minRecommendationRating?: number;
  }): Promise<AppSettingsState> {
    const body: Record<string, unknown> = {};
    if (payload.tmdbApiKey !== undefined) body.tmdb_api_key = payload.tmdbApiKey;
    if (payload.includeMovies !== undefined) body.include_movies = payload.includeMovies;
    if (payload.includeSeries !== undefined) body.include_series = payload.includeSeries;
    if (payload.minRecommendationRating !== undefined)
      body.min_recommendation_rating = payload.minRecommendationRating;

    const data = await request<SettingsWire>("/api/settings", {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return fromSettingsWire(data);
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    const data = await request<AnalyticsWire>("/api/analytics");
    return fromAnalyticsWire(data);
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    const data = await request<NotificationWire[]>("/api/notifications");
    return data.map(fromNotificationWire);
  },

  // Browse
  async browse(params: { type: MediaType; query?: string; page?: number }): Promise<BrowseResult[]> {
    const qs = new URLSearchParams({ media_type: params.type });
    if (params.query) qs.set("query", params.query);
    if (params.page) qs.set("page", String(params.page));
    const data = await request<BrowseResultWire[]>(`/api/browse?${qs.toString()}`);
    return data.map(fromBrowseResultWire);
  },
  async markTitleWatched(tmdbId: number, type: MediaType): Promise<WatchedItem> {
    const data = await request<WatchedWire>(`/api/browse/${tmdbId}/watched?media_type=${type}`, {
      method: "POST",
    });
    return fromWatchedWire(data);
  },
  async addTitleToWatchlist(tmdbId: number, type: MediaType): Promise<WatchlistItem> {
    const data = await request<WatchlistWire>(`/api/browse/${tmdbId}/watchlist?media_type=${type}`, {
      method: "POST",
    });
    return fromWatchlistWire(data);
  },
};
