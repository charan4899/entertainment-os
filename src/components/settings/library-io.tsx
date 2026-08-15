"use client";

import { useRef, useState } from "react";
import { Database, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "./settings-section";
import { useLibrary } from "@/lib/store";
import type { WatchedItem, WatchlistItem } from "@/lib/types";

function isWatchedArray(value: unknown): value is WatchedItem[] {
  return Array.isArray(value) && value.every((v) => typeof v?.id === "string" && typeof v?.title === "string");
}
function isWatchlistArray(value: unknown): value is WatchlistItem[] {
  return Array.isArray(value) && value.every((v) => typeof v?.id === "string" && typeof v?.title === "string");
}

export function LibraryIO() {
  const { watched, watchlist, importLibrary } = useLibrary();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [importing, setImporting] = useState(false);

  function handleExport() {
    const payload = {
      exportedAt: new Date().toISOString(),
      watched,
      watchlist,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `entertainment-os-library-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus({ type: "success", message: "Library exported to a local JSON file." });
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!isWatchedArray(parsed.watched) || !isWatchlistArray(parsed.watchlist)) {
          throw new Error("Missing watched[] or watchlist[] arrays");
        }
        setImporting(true);
        await importLibrary({ watched: parsed.watched, watchlist: parsed.watchlist });
        setStatus({
          type: "success",
          message: `Imported ${parsed.watched.length} watched and ${parsed.watchlist.length} watchlist titles (added to your current library).`,
        });
      } catch {
        setStatus({
          type: "error",
          message: "That file doesn't match the Entertainment OS export format, or the import was interrupted partway.",
        });
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <SettingsSection
      icon={Database}
      title="Library"
      description="Export your archive as JSON, or add titles back in from a previous export."
    >
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={handleExport} disabled={importing}>
          <Download className="h-3.5 w-3.5" />
          Export Library
        </Button>
        <Button variant="secondary" onClick={handleImportClick} disabled={importing}>
          <Upload className="h-3.5 w-3.5" />
          {importing ? "Importing..." : "Import Library"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {status && (
        <p
          className={`mt-3 text-xs ${status.type === "success" ? "text-success" : "text-danger"}`}
        >
          {status.message}
        </p>
      )}
    </SettingsSection>
  );
}
