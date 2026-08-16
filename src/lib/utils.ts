import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class lists safely, resolving conflicting utilities. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a minute count as "312h 40m" for watch-time readouts. */
export function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/** Format a date string as "12 Aug 2026". */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Format a relative "3d ago" / "just now" style timestamp for activity feeds. */
export function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "just now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
  if (diffMs < 30 * day) return `${Math.floor(diffMs / day)}d ago`;
  return formatDate(iso);
}

/** Deterministic 2-letter monogram used by poster placeholders. */
export function monogram(title: string): string {
  const words = title.replace(/[^a-zA-Z0-9 ]/g, "").split(" ").filter(Boolean);
  if (words.length === 0) return "??";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export type PosterAccent = "cyan" | "blue" | "purple" | "green" | "amber";
const ACCENTS: PosterAccent[] = ["cyan", "blue", "purple", "green", "amber"];

/** Deterministic accent color derived from a title — used so the same
 * title always gets the same placeholder color without the backend
 * needing to store one. */
export function hashAccent(title: string): PosterAccent {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash * 31 + title.charCodeAt(i)) >>> 0;
  }
  return ACCENTS[hash % ACCENTS.length];
}

/** Escapes a single CSV field — quotes it (doubling any internal quotes)
 * only if it contains a comma, quote, or newline, per RFC 4180. */
function csvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Builds CSV text (CRLF line endings) from a header row and data rows. */
export function toCsv(headers: string[], rows: string[][]): string {
  return [headers, ...rows].map((row) => row.map(csvField).join(",")).join("\r\n");
}

/** Triggers a browser download of text content — no server round-trip. A
 * UTF-8 BOM is prepended for CSV so Excel renders accented characters
 * correctly instead of mangling them. */
export function downloadTextFile(filename: string, content: string, mimeType = "text/plain") {
  const prefix = mimeType.includes("csv") ? "\uFEFF" : "";
  const blob = new Blob([prefix + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
