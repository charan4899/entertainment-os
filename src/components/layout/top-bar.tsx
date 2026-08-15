"use client";

import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { GlobalSearch } from "./global-search";
import { StatusDot } from "@/components/common/status-dot";

function useClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Hydrate the clock on mount only — reading Date() during render would
    // differ between server and client and cause a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return now;
}

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const now = useClock();

  return (
    <header className="glass-panel sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 rounded-none border-x-0 border-t-0 px-4 sm:px-6">
      <button
        onClick={onMenuClick}
        className="text-text-muted transition-colors hover:text-text md:hidden"
        aria-label="Toggle navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <GlobalSearch />

      <div className="ml-auto flex items-center gap-5">
        <div className="hidden items-center gap-2 sm:flex">
          <StatusDot color="success" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-text-muted">
            Systems nominal
          </span>
        </div>
        <div className="hidden font-mono text-xs tabular-nums text-text-muted sm:block">
          {now
            ? now.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })
            : "--:--:--"}
        </div>
      </div>
    </header>
  );
}
