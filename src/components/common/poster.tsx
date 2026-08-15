import Image from "next/image";
import { Film, Tv } from "lucide-react";
import { cn, hashAccent, monogram, type PosterAccent } from "@/lib/utils";
import type { MediaType } from "@/lib/types";

const ACCENT_GRADIENTS: Record<PosterAccent, string> = {
  cyan: "from-[#0b3a45] via-[#08222c] to-[#050a0e]",
  blue: "from-[#0e2a5c] via-[#0b1a37] to-[#050a0e]",
  purple: "from-[#331a5c] via-[#1c1032] to-[#0a0611]",
  green: "from-[#0e3d2c] via-[#0a2419] to-[#050c09]",
  amber: "from-[#4a2e0a] via-[#2c1c08] to-[#0c0803]",
};

const ACCENT_TEXT: Record<PosterAccent, string> = {
  cyan: "text-primary-strong",
  blue: "text-[#8fb4ff]",
  purple: "text-[#c9a6ff]",
  green: "text-success",
  amber: "text-warning",
};

interface PosterProps {
  title: string;
  type: MediaType;
  posterUrl?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES: Record<NonNullable<PosterProps["size"]>, string> = {
  sm: "h-14 w-10",
  md: "h-24 w-16",
  lg: "h-40 w-28",
};

const SIZE_PX: Record<NonNullable<PosterProps["size"]>, { w: number; h: number }> = {
  sm: { w: 40, h: 56 },
  md: { w: 64, h: 96 },
  lg: { w: 112, h: 160 },
};

export function Poster({ title, type, posterUrl, className, size = "md" }: PosterProps) {
  const Icon = type === "movie" ? Film : Tv;

  if (posterUrl) {
    const { w, h } = SIZE_PX[size];
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-lg border border-border bg-bg-raised",
          SIZE_CLASSES[size],
          className
        )}
      >
        <Image
          src={posterUrl}
          alt={title}
          width={w}
          height={h}
          className="h-full w-full object-cover"
          unoptimized
        />
      </div>
    );
  }

  const accent = hashAccent(title);
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-gradient-to-br",
        ACCENT_GRADIENTS[accent],
        SIZE_CLASSES[size],
        className
      )}
    >
      <span
        className={cn(
          "font-display text-lg font-semibold tracking-wide",
          ACCENT_TEXT[accent]
        )}
      >
        {monogram(title)}
      </span>
      <Icon className={cn("absolute bottom-1 right-1 h-3 w-3 opacity-40", ACCENT_TEXT[accent])} />
    </div>
  );
}
