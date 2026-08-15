"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "./settings-section";
import { api, ApiError, type BackfillSeasonsResult } from "@/lib/api";
import { useLibrary } from "@/lib/store";

export function SeasonBackfill() {
  const { refreshAll } = useLibrary();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<BackfillSeasonsResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.backfillSeasons();
      setResult(res);
      if (res.updated.length > 0) {
        await refreshAll();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't run the fix.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <SettingsSection
      icon={Wrench}
      title="Fix Season Counts"
      description="One-time fix for shows marked watched before season counts were recorded correctly — safe to run more than once."
    >
      <Button variant="secondary" onClick={handleRun} disabled={running}>
        {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wrench className="h-3.5 w-3.5" />}
        {running ? "Checking your watched series..." : "Run Fix"}
      </Button>

      {error && <p className="mt-3 text-xs text-danger">{error}</p>}

      {result && (
        <div className="mt-4 space-y-2">
          {result.updated.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success-soft px-3 py-2">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
              <p className="text-xs text-success">
                Nothing to fix — every watched series already has the right season count.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-text-muted">
                Corrected {result.updated.length} show{result.updated.length === 1 ? "" : "s"}:
              </p>
              <ul className="space-y-1">
                {result.updated.map((u) => (
                  <li
                    key={u.title}
                    className="flex items-center justify-between rounded-lg border border-border bg-white/[0.02] px-3 py-2 text-xs"
                  >
                    <span className="text-text">{u.title}</span>
                    <span className="font-mono text-text-dim">
                      {u.previousSeasonsWatched ?? "—"} → {u.newSeasonsWatched}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {result.skippedCount > 0 && (
            <p className="text-xs text-text-dim">
              {result.skippedCount} title{result.skippedCount === 1 ? "" : "s"} couldn&rsquo;t be checked
              (TMDb couldn&rsquo;t resolve them) and were left as-is.
            </p>
          )}
        </div>
      )}
    </SettingsSection>
  );
}
