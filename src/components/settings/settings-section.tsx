"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { GlassPanel } from "@/components/common/glass-panel";

interface SettingsSectionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}

export function SettingsSection({ icon: Icon, title, description, children }: SettingsSectionProps) {
  return (
    <GlassPanel className="p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary-soft">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-base font-semibold text-text">{title}</h2>
          <p className="mt-0.5 text-xs text-text-muted">{description}</p>
        </div>
      </div>
      {children}
    </GlassPanel>
  );
}
