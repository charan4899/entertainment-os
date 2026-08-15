"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import { SettingsSection } from "./settings-section";
import { useLibrary } from "@/lib/store";

export function RecommendationSettings() {
  const { settings, updateSettings } = useLibrary();
  const [pending, setPending] = useState<string | null>(null);

  if (!settings) return null;

  async function handleToggle(field: "includeMovies" | "includeSeries", value: boolean) {
    setPending(field);
    try {
      await updateSettings({ [field]: value });
    } finally {
      setPending(null);
    }
  }

  async function handleRatingChange(value: string) {
    setPending("minRecommendationRating");
    try {
      await updateSettings({ minRecommendationRating: Number(value) });
    } finally {
      setPending(null);
    }
  }

  return (
    <SettingsSection
      icon={SlidersHorizontal}
      title="Recommendation Settings"
      description="Applied live by the recommendation engine — no restart needed."
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text">Include movies</p>
            <p className="text-xs text-text-dim">Surface feature-length recommendations</p>
          </div>
          <Switch
            checked={settings.includeMovies}
            disabled={pending === "includeMovies"}
            onChange={(v) => handleToggle("includeMovies", v)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text">Include series</p>
            <p className="text-xs text-text-dim">Surface series recommendations</p>
          </div>
          <Switch
            checked={settings.includeSeries}
            disabled={pending === "includeSeries"}
            onChange={(v) => handleToggle("includeSeries", v)}
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-text">Minimum IMDb rating</p>
            <p className="text-xs text-text-dim">Filter out low-rated matches</p>
          </div>
          <Select
            value={String(settings.minRecommendationRating)}
            onChange={(e) => handleRatingChange(e.target.value)}
            className="w-28"
            disabled={pending === "minRecommendationRating"}
          >
            <option value="0">Any</option>
            <option value="6">6.0+</option>
            <option value="7">7.0+</option>
            <option value="8">8.0+</option>
          </Select>
        </div>
      </div>
    </SettingsSection>
  );
}
