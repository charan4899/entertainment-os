"use client";

import { useState, type ReactNode } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { MobileNav } from "./mobile-nav";
import { ParticleField } from "@/components/common/particle-field";
import { useLibrary } from "@/lib/store";

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { loading, connectionError } = useLibrary();

  return (
    <div className="relative flex h-screen overflow-hidden">
      <ParticleField />
      <div className="grid-field pointer-events-none fixed inset-0 -z-10" aria-hidden />

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenuClick={() => setMobileOpen(true)} />

        {connectionError && (
          <div className="flex items-center gap-2 border-b border-danger/30 bg-danger-soft px-4 py-2 sm:px-8">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-danger" />
            <p className="text-xs text-danger">{connectionError}</p>
          </div>
        )}

        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-sm text-text-dim">Connecting to your archive...</p>
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
