"use client";

import { CSSProperties } from "react";
import { Sparkles } from "lucide-react";
import type { AnnouncementData } from "@/lib/site-data";

/**
 * Single scrolling announcement bar (scope UI spec §8).
 * Right-to-left marquee, pauses on hover. Text may contain "||" to separate
 * multiple messages rendered with a star separator.
 *
 * Bar colors (background, text, star icons and bottom border) come from the
 * active theme - bar 1 vs bar 2 select their own theme variables.
 */
export function AnnouncementBar({
  announcement,
  tone = 1,
}: {
  announcement: AnnouncementData;
  tone?: 1 | 2;
}) {
  const messages = announcement.text
    .split("||")
    .map((m) => m.trim())
    .filter(Boolean);

  if (!messages.length) return null;

  const speed = Math.max(8, announcement.speed || 30);

  const trackStyle = {
    "--announcement-speed": `${speed}s`,
    fontSize: `${Math.max(13, announcement.fontSize || 15)}px`,
  } as CSSProperties;

  const renderSet = (hidden: boolean) => (
    <div
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center"
    >
      {messages.map((msg, i) => (
        <span key={i} className="flex items-center">
          {i > 0 && <Sparkles className="mx-6 h-4 w-4 opacity-70" />}
          <span className="whitespace-nowrap">{msg}</span>
        </span>
      ))}
      <Sparkles className="mx-6 h-4 w-4 opacity-70" />
    </div>
  );

  const fontStyle =
    announcement.fontStyle &&
    (announcement.fontStyle.toLowerCase().includes("bold") ||
      announcement.fontStyle.toLowerCase() === "600")
      ? "font-semibold"
      : "font-normal";

  return (
    <div
      role="region"
      aria-label={announcement.title ?? "Announcement"}
      className="announcement-wrap overflow-hidden border-b"
      style={{
        backgroundColor: `var(--jaiguru-announcement-${tone}-bg, #10b981)`,
        color: `var(--jaiguru-announcement-${tone}-text, #ffffff)`,
        borderColor: `var(--jaiguru-announcement-${tone}-border, rgba(255,255,255,0.3))`,
      }}
    >
      <div
        className={`announcement-track flex w-max items-center gap-0 py-1.5 tracking-wide ${fontStyle}`}
        style={trackStyle}
      >
        {renderSet(false)}
        {renderSet(true)}
      </div>
    </div>
  );
}