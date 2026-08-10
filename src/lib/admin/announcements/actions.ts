"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

/**
 * Admin Announcement Bar manager (2 fixed slots).
 * The public site renders exactly the two bars managed here (verified by
 * the `take: 2` in site-data). Saving this form:
 *  1. upserts bar slot 1 and bar slot 2 in place (keeping their ids),
 *  2. deletes any OTHER announcement rows left over from earlier phases,
 *     so the homepage can never show more than two bars again.
 */

export interface AnnouncementsFormState {
  error?: string;
  success?: boolean;
  deletedCount?: number;
}

function num(fd: FormData, key: string, fallback: number, min: number, max: number): number {
  const n = Number.parseInt(String(fd.get(key) ?? ""), 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

export async function saveAnnouncementsAction(
  _state: AnnouncementsFormState | undefined,
  fd: FormData
): Promise<AnnouncementsFormState> {
  await requireAdmin();

  try {
    const rows = await prisma.announcement.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    const managed = rows.slice(0, 2);
    const managedIds = new Set(managed.map((r) => r.id));

    for (let slot = 0; slot < 2; slot++) {
      const prefix = `slot${slot}`;
      const text = String(fd.get(`${prefix}-text`) ?? "").trim();
      const title = String(fd.get(`${prefix}-title`) ?? "").trim() || null;
      const isActive = text.length > 0 && fd.get(`${prefix}-active`) === "on";
      const fontStyle =
        String(fd.get(`${prefix}-fontStyle`) ?? "") === "bold" ? "bold" : "normal";

      const data = {
        title,
        text: text || " ",
        textColor: "#FFFFFF",
        backgroundColor: "#4C1D95",
        fontSize: num(fd, `${prefix}-fontSize`, 16, 12, 24),
        fontStyle,
        speed: num(fd, `${prefix}-speed`, 30, 8, 120),
        isActive,
        sortOrder: slot,
      };

      if (managed[slot]) {
        await prisma.announcement.update({
          where: { id: managed[slot].id },
          data,
        });
      } else {
        await prisma.announcement.create({ data });
      }
    }

    const cleanup = await prisma.announcement.deleteMany({
      where: { id: { notIn: [...managedIds] } },
    });

    revalidatePath("/");
    return { success: true, deletedCount: cleanup.count };
  } catch (e) {
    console.error("[admin] saveAnnouncementsAction failed:", e);
    return { error: "Could not save announcement bars. Please try again." };
  }
}