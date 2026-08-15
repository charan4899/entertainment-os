"use client";

import { Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { SettingsSection } from "./settings-section";

export function AppearanceSettings() {
  return (
    <SettingsSection
      icon={Moon}
      title="Appearance"
      description="Entertainment OS is a dark-theme instrument panel by design."
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text">Dark theme</p>
          <p className="text-xs text-text-dim">Always on — there is no light mode</p>
        </div>
        <Switch checked disabled onChange={() => {}} label="Dark theme (locked)" />
      </div>
    </SettingsSection>
  );
}
