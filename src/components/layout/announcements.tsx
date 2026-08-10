import { AnnouncementBar } from "@/components/layout/announcement-bar";
import type { AnnouncementData } from "@/lib/site-data";

/**
 * Renders all active announcement bars (scope UI spec §8).
 * Both bars stack directly below the main header. Bar 1 and bar 2 take
 * their colors from the active theme (theme variables), any extra bars
 * cycle back to tone 1/2.
 */
export function AnnouncementBars({
  announcements,
}: {
  announcements: AnnouncementData[];
}) {
  return (
    <div aria-label="Announcements" className="w-full">
      {announcements.map((a, i) => (
        <AnnouncementBar
          key={a.id}
          announcement={a}
          tone={i % 2 === 0 ? 1 : 2}
        />
      ))}
    </div>
  );
}
