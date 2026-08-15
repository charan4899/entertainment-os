"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  Bell,
  Bookmark,
  LayoutDashboard,
  Settings,
  Sparkles,
  Eye,
  ChevronsLeft,
  Radio,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/watched", label: "Watched", icon: Eye },
  { href: "/watchlist", label: "Watchlist", icon: Bookmark },
  { href: "/browse", label: "Browse", icon: Compass },
  { href: "/recommendations", label: "Recommendations", icon: Sparkles },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 248 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel relative z-20 hidden h-screen shrink-0 flex-col rounded-none border-y-0 border-l-0 md:flex"
    >
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary/40 bg-primary-soft">
          <Radio className="h-4 w-4 text-primary animate-pulse-glow" />
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="font-display text-sm font-semibold tracking-[0.14em] text-text"
          >
            ENTERTAINMENT&nbsp;OS
          </motion.span>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-5">
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-200",
                active
                  ? "text-primary-strong"
                  : "text-text-muted hover:text-text"
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-lg border border-primary/35 bg-primary-soft"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              {active && (
                <span className="absolute left-0 h-5 w-[3px] rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
              )}
              <Icon className="relative z-10 h-[18px] w-[18px] shrink-0" />
              {!collapsed && (
                <span className="relative z-10 truncate font-medium">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={onToggle}
        className="flex h-12 items-center justify-center gap-2 border-t border-border text-text-dim transition-colors hover:text-primary"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronsLeft
          className={cn(
            "h-4 w-4 transition-transform duration-300",
            collapsed && "rotate-180"
          )}
        />
      </button>
    </motion.aside>
  );
}
