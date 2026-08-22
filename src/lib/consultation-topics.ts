import type { LucideIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  TOPIC_ICONS,
  DEFAULT_CONSULTATION_TOPICS,
  type ConsultationTopicRow,
} from "@/lib/consultation-topics-data";

/**
 * Shared consultation topics (scope §7.5) — CMS-driven.
 * Rows live in the `ConsultationTopic` table (admin-editable under
 * /admin/consultation-topics) and are hydrated with Lucide icons here.
 * Falls back to DEFAULT_CONSULTATION_TOPICS when the table is empty.
 */
export interface ConsultationTopic {
  id?: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  icon: LucideIcon;
  iconKey: string;
  href: string;
  fee: string;
  /** Home Visit (in-person at your location) fee — higher due to travel. */
  homeFee: string;
  /** Session length in minutes used by the booking calendar. */
  durationMinutes: number;
  /** Keywords used to match related products & services. */
  keywords: string[];
  /** Short benefit bullets shown on the dedicated page. */
  benefits: string[];
}

function toTopic(row: ConsultationTopicRow): ConsultationTopic {
  return {
    ...row,
    icon: TOPIC_ICONS[row.iconKey] ?? TOPIC_ICONS.star,
    href: `/consultations/${row.slug}`,
  };
}

export async function getConsultationTopics(): Promise<ConsultationTopic[]> {
  try {
    const rows = await prisma.consultationTopic.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    });
    if (rows.length > 0) return rows.map((r) => toTopic(r));
  } catch (e) {
    console.error("[consultation-topics] DB read failed, using fallback:", e);
  }
  return DEFAULT_CONSULTATION_TOPICS.map(toTopic);
}

export async function getConsultationTopic(
  slug: string
): Promise<ConsultationTopic | null> {
  return (await getConsultationTopics()).find((t) => t.slug === slug) ?? null;
}
