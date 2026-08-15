import { PageHeader } from "@/components/common/page-header";
import { AppearanceSettings } from "@/components/settings/appearance-settings";
import { LibraryIO } from "@/components/settings/library-io";
import { TmdbKeyForm } from "@/components/settings/tmdb-key-form";
import { RecommendationSettings } from "@/components/settings/recommendation-settings";
import { SeasonBackfill } from "@/components/settings/season-backfill";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Control panel for the system — appearance, data, and integrations."
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <AppearanceSettings />
        <LibraryIO />
        <TmdbKeyForm />
        <RecommendationSettings />
        <SeasonBackfill />
      </div>
    </div>
  );
}
