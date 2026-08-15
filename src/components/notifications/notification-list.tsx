"use client";

import { useEffect, useState } from "react";
import { Bell, Clock, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import type { NotificationItem } from "@/lib/types";
import { GlassPanel } from "@/components/common/glass-panel";
import { Badge } from "@/components/ui/badge";

export function NotificationList() {
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getNotifications()
      .then(setItems)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't check for updates."));
  }, []);

  if (error) {
    return (
      <GlassPanel className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <Bell className="h-6 w-6 text-warning" />
        <p className="max-w-sm text-sm text-text-muted">{error}</p>
        <Link
          href="/settings"
          className="text-sm text-primary underline underline-offset-2 hover:text-primary-strong"
        >
          Open Settings
        </Link>
      </GlassPanel>
    );
  }

  if (items === null) {
    return (
      <GlassPanel className="flex flex-col items-center gap-3 px-6 py-20 text-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <p className="text-sm text-text-dim">Checking TMDb for season updates...</p>
      </GlassPanel>
    );
  }

  if (items.length === 0) {
    return (
      <GlassPanel className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <Sparkles className="h-6 w-6 text-primary" />
        <p className="max-w-sm text-sm text-text-muted">
          No new or upcoming seasons for the series in your watched list right now.
        </p>
      </GlassPanel>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <GlassPanel key={`${item.tmdbId}-${item.kind}`} className="flex items-center gap-4 p-5">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
              item.kind === "season_released"
                ? "border-success/30 bg-success-soft"
                : "border-warning/30 bg-warning-soft"
            }`}
          >
            {item.kind === "season_released" ? (
              <Bell className="h-5 w-5 text-success" />
            ) : (
              <Clock className="h-5 w-5 text-warning" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-text">{item.seriesTitle}</p>
              <Badge variant={item.kind === "season_released" ? "green" : "amber"} className="normal-case">
                {item.kind === "season_released" ? "Season Released" : "Season Announced"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-text-muted">{item.message}</p>
          </div>
        </GlassPanel>
      ))}
    </div>
  );
}
