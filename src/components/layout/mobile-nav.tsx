"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radio, X } from "lucide-react";
import { NAV_ITEMS } from "./sidebar";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel fixed inset-y-0 left-0 z-50 flex w-72 flex-col rounded-none border-y-0 border-l-0 md:hidden"
          >
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-primary/40 bg-primary-soft">
                  <Radio className="h-4 w-4 text-primary" />
                </div>
                <span className="font-display text-sm font-semibold tracking-[0.14em]">
                  ENTERTAINMENT OS
                </span>
              </div>
              <button onClick={onClose} aria-label="Close navigation">
                <X className="h-5 w-5 text-text-muted" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 px-3 py-5">
              {NAV_ITEMS.map((item) => {
                const active = pathname?.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "border border-primary/35 bg-primary-soft text-primary-strong"
                        : "text-text-muted hover:text-text"
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
