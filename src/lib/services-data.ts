import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/shop-data";

/**
 * Public services data layer (Phase 6).
 * Reads services for the public /services listing and /services/[slug]
 * detail pages. Fails soft so public pages always render.
 */

export type ServiceMode = "ONLINE" | "OFFLINE" | "HOME_SERVICE";

export const SERVICE_MODE_LABELS: Record<ServiceMode, string> = {
  ONLINE: "Online",
  OFFLINE: "Offline",
  HOME_SERVICE: "Home Service",
};

export const SERVICE_MODE_SLUGS: Record<string, ServiceMode | null> = {
  online: "ONLINE",
  offline: "OFFLINE",
  "home-service": "HOME_SERVICE",
};

export interface ServiceCardData {
  id: string;
  name: string;
  slug: string;
  mode: ServiceMode;
  duration: string | null;
  price: string;
  priceLabel: string | null;
  shortDescription: string | null;
  imageUrl: string | null;
  categoryName: string;
  categorySlug: string;
}

export const getServices = cache(
  async (mode?: ServiceMode | null): Promise<ServiceCardData[]> => {
    try {
      const rows = await prisma.service.findMany({
        where: { isActive: true, ...(mode ? { mode: mode as never } : {}) },
        include: { category: { select: { name: true, slug: true } } },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      });
      return rows.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        mode: s.mode as ServiceMode,
        duration: s.duration,
        price: s.price ? s.price.toString() : "",
        priceLabel: s.priceLabel,
        shortDescription: s.shortDescription,
        imageUrl: s.imageUrl,
        categoryName: s.category?.name ?? "Services",
        categorySlug: s.category?.slug ?? "services",
      }));
    } catch (e) {
      console.error("[services-data] getServices failed:", e);
      return [];
    }
  }
);

export interface ServiceDetailData extends ServiceCardData {
  longDescription: string | null;
  benefits: string[];
  syllabus: string[];
  serviceArea: string | null;
  slotDuration: number | null;
  related: ServiceCardData[];
}

export const getServiceBySlug = cache(
  async (slug: string): Promise<ServiceDetailData | null> => {
    try {
      const row = await prisma.service.findFirst({
        where: { slug, isActive: true },
        include: { category: { select: { name: true, slug: true } } },
      });
      if (!row) return null;

      const related = await prisma.service.findMany({
        where: {
          isActive: true,
          id: { not: row.id },
          categoryId: row.categoryId,
        },
        include: { category: { select: { name: true, slug: true } } },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        take: 3,
      });

      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        mode: row.mode as ServiceMode,
        duration: row.duration,
        price: row.price ? row.price.toString() : "",
        priceLabel: row.priceLabel,
        shortDescription: row.shortDescription,
        categoryName: row.category?.name ?? "Services",
        categorySlug: row.category?.slug ?? "services",
        imageUrl: row.imageUrl,
        longDescription: row.longDescription,
        benefits: row.benefits ?? [],
        syllabus: row.syllabus ?? [],
        serviceArea: row.serviceArea,
        slotDuration: row.slotDuration,
        related: related.map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          mode: s.mode as ServiceMode,
          duration: s.duration,
          price: s.price ? s.price.toString() : "",
          priceLabel: s.priceLabel,
          shortDescription: s.shortDescription,
          imageUrl: s.imageUrl,
          categoryName: s.category?.name ?? "Services",
          categorySlug: s.category?.slug ?? "services",
        })),
      };
    } catch (e) {
      console.error("[services-data] getServiceBySlug failed:", e);
      return null;
    }
  }
);

export { formatPrice };
