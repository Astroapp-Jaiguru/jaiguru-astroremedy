import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { AnnouncementsForm, type AnnouncementSlot } from "@/components/admin/settings/announcements-form";

export const metadata = { title: "Announcements | Admin" };

const EMPTY_SLOT: AnnouncementSlot = {
  title: null,
  text: "",
  fontSize: 16,
  fontStyle: "normal",
  speed: 30,
  isActive: true,
};

export default async function AdminAnnouncementsPage() {
  await requireAdmin();

  const rows = await prisma.announcement.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const slots: AnnouncementSlot[] = rows.slice(0, 2).map((r) => ({
    title: r.title,
    text: r.text.trim() === " " ? "" : r.text,
    fontSize: r.fontSize,
    fontStyle: r.fontStyle,
    speed: r.speed,
    isActive: r.isActive,
  }));
  while (slots.length < 2) slots.push({ ...EMPTY_SLOT });

  const extraCount = Math.max(0, rows.length - 2);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Announcements</h1>
        <p className="text-sm text-muted-foreground">
          Two scrolling announcement bars. Edit both bars here and save — the homepage shows
          exactly these two (bar colors follow the active theme).
        </p>
      </div>
      <AnnouncementsForm initial={{ slots, extraCount }} />
    </div>
  );
}