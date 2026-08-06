import { AnnouncementBar } from "@/components/layout/announcement-bar";
import type { AnnouncementData } from "@/lib/site-data";

/**
 * Renders all active announcement bars (scope UI spec §8).
 * Both bars stack directly below the main header.
 */
export function AnnouncementBars({
  announcements,
}: {
  announcements: AnnouncementData[];
}) {
  return (
    <div aria-label="Announcements" className="w-full">
      {announcements.map((a) => (
        <AnnouncementBar key={a.id} announcement={a} />
      ))}
    </div>
  );
}
