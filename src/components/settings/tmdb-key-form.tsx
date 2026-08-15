"use client";

import { useState } from "react";
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SettingsSection } from "./settings-section";
import { useLibrary } from "@/lib/store";
import { ApiError } from "@/lib/api";

export function TmdbKeyForm() {
  const { settings, updateSettings } = useLibrary();
  const [key, setKey] = useState("");
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!key.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await updateSettings({ tmdbApiKey: key.trim() });
      setKey("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save the key.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsSection
      icon={KeyRound}
      title="TMDb API Key"
      description="Stored server-side and used for search, recommendations, and season notifications."
    >
      {settings?.tmdbApiKeySet && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-success/30 bg-success-soft px-3 py-2">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
          <p className="text-xs text-success">A key is currently configured.</p>
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Input
            type={visible ? "text" : "password"}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={settings?.tmdbApiKeySet ? "Replace the saved key..." : "Paste your TMDb v3 API key"}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim transition-colors hover:text-text"
            aria-label={visible ? "Hide key" : "Show key"}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <Button variant="primary" onClick={handleSave} disabled={saving || !key.trim()}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {saved ? "Saved" : "Save Key"}
        </Button>
      </div>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      <p className="mt-3 text-xs text-text-dim">
        Get a free key from{" "}
        <a
          href="https://www.themoviedb.org/settings/api"
          target="_blank"
          rel="noreferrer"
          className="text-primary underline underline-offset-2 hover:text-primary-strong"
        >
          themoviedb.org/settings/api
        </a>
        .
      </p>
    </SettingsSection>
  );
}
