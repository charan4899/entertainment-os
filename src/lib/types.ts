export type MediaType = "movie" | "series";
export type Priority = "low" | "medium" | "high";

export interface WatchedItem {
  id: string;
  tmdbId: number | null;
  title: string;
  type: MediaType;
  imdbRating: number;
  genres: string[];
  year: number;
  watchedDate: string; // ISO date
  favorite: boolean;
  runtimeMinutes: number;
  seasonsWatched?: number | null;
  posterUrl: string | null;
  director?: string | null;
  cast?: string[];
}

export interface WatchlistItem {
  id: string;
  tmdbId: number | null;
  title: string;
  type: MediaType;
  imdbRating: number;
  genres: string[];
  year: number;
  addedDate: string; // ISO date
  runtimeMinutes: number;
  posterUrl: string | null;
  priority: Priority;
  director?: string | null;
  cast?: string[];
}

/** Recommendations aren't persisted rows — tmdbId + type is the stable key. */
export interface RecommendationItem {
  tmdbId: number;
  title: string;
  type: MediaType;
  imdbRating: number;
  genres: string[];
  year: number;
  reason: string;
  matchScore: number;
  posterUrl: string | null;
}

export interface ActivityEvent {
  id: string;
  label: string;
  detail: string;
  timestamp: string; // ISO datetime
  kind: "watched" | "watchlist" | "favorite" | "system";
}

export interface SearchResult {
  tmdbId: number;
  title: string;
  type: MediaType;
  year: number | null;
  posterUrl: string | null;
  imdbRating: number;
}

export interface AppSettingsState {
  tmdbApiKeySet: boolean;
  includeMovies: boolean;
  includeSeries: boolean;
  minRecommendationRating: number;
}

export interface GenreCount {
  genre: string;
  count: number;
}
export interface YearCount {
  year: number;
  count: number;
}
export interface NameCount {
  name: string;
  count: number;
}

export interface AnalyticsData {
  moviesWatched: number;
  seriesWatched: number;
  totalWatchMinutes: number;
  genreDistribution: GenreCount[];
  releaseYearDistribution: YearCount[];
  topGenres: GenreCount[];
  topDirectors: NameCount[];
  topActors: NameCount[];
}

export interface NotificationItem {
  seriesTitle: string;
  tmdbId: number;
  kind: "season_released" | "season_announced";
  message: string;
  seasonNumber?: number | null;
}

export interface BrowseResult {
  tmdbId: number;
  title: string;
  type: MediaType;
  year: number | null;
  posterUrl: string | null;
  imdbRating: number;
  alreadyWatched: boolean;
  inWatchlist: boolean;
}
