import { AnnouncementBar } from "@/components/layout/announcement-bar";
import type { AnnouncementData } from "@/lib/site-data";

/**
 * Renders all active announcement bars (scope UI spec §8).
 * The site enforces exactly TWO bars: they stack directly below the main
 * header, and bar 1 / bar 2 take their colors from the active theme's
 * announcement variables (tone 1 / tone 2).
 */
export function AnnouncementBars({
  announcements,
}: {
  announcements: AnnouncementData[];
}) {
  return (
    <div aria-label="Announcements" className="w-full">
      {announcements.slice(0, 2).map((a, i) => (
        <AnnouncementBar
          key={a.id}
          announcement={a}
          tone={i % 2 === 0 ? 1 : 2}
        />
      ))}
    </div>
  );
}
