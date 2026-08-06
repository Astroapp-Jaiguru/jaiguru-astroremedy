"use client";

import { CSSProperties } from "react";
import { Sparkles } from "lucide-react";
import type { AnnouncementData } from "@/lib/site-data";

/**
 * Single scrolling announcement bar (scope UI spec §8).
 * Right-to-left marquee, pauses on hover. Text may contain "||" to separate
 * multiple messages rendered with a star separator.
 */
export function AnnouncementBar({
  announcement,
}: {
  announcement: AnnouncementData;
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
      className="announcement-wrap overflow-hidden"
      style={{
        backgroundColor: announcement.backgroundColor,
        color: announcement.textColor,
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