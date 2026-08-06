import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * Public shop data layer (Phase 4).
 * Reads featured products, services and testimonials for the homepage.
 * Every getter is cached per request and fails soft (returns []) so the
 * homepage always renders, even if the database is unreachable.
 */

type DecimalLike = { toString(): string } | number | string;

/** Format a price as INR with Indian digit grouping, e.g. 4999 -> "₹4,999". */
export function formatPrice(value: DecimalLike | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = value.toString();
  const n = Number.parseFloat(s);
  if (!Number.isFinite(n)) return s;
  const [int, dec] = n.toFixed(2).split(".");
  const last3 = int.slice(-3);
  const rest = int.slice(0, -3);
  const grouped = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3 : last3;
  return `₹${grouped}${dec === "00" ? "" : "." + dec}`;
}

export interface FeaturedProduct {
  id: string;
  name: string;
  slug: string;
  mainImage: string | null;
  subcategory: string | null;
  price: string;
  discountPrice: string | null;
  shortDescription: string | null;
  stockStatus: string;
  category: { name: string; slug: string } | null;
  isPopular: boolean;
  isNewArrival: boolean;
  rating: string;
  ratingCount: number;
}

export const getFeaturedProducts = cache(
  async (limit = 12): Promise<FeaturedProduct[]> => {
    try {
      const rows = await prisma.product.findMany({
        where: { isActive: true, isFeatured: true },
        include: { category: { select: { name: true, slug: true } } },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        take: limit,
      });
      return rows.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        mainImage: p.mainImage,
        subcategory: p.subcategory,
        price: p.price.toString(),
        discountPrice: p.discountPrice ? p.discountPrice.toString() : null,
        shortDescription: p.shortDescription,
        stockStatus: p.stockStatus,
        category: p.category,
        isPopular: p.isPopular,
        isNewArrival: p.isNewArrival,
        rating: p.rating.toString(),
        ratingCount: p.ratingCount,
      }));
    } catch (e) {
      console.error("[shop-data] getFeaturedProducts failed:", e);
      return [];
    }
  }
);

export interface FeaturedService {
  id: string;
  name: string;
  slug: string;
  mode: string;
  duration: string | null;
  price: string;
  priceLabel: string | null;
  shortDescription: string | null;
  categoryName: string;
  categorySlug: string;
}

export interface ServiceGroup {
  name: string;
  slug: string;
  services: FeaturedService[];
}

export const getFeaturedServices = cache(async (): Promise<ServiceGroup[]> => {
  try {
    const groups = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      include: {
        services: {
          where: { isActive: true, isFeatured: true },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        },
      },
      orderBy: { sortOrder: "asc" },
    });
    return groups
      .map((g) => ({
        name: g.name,
        slug: g.slug,
        services: g.services.map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          mode: s.mode,
          duration: s.duration,
          price: (s.price ?? 0).toString(),
          priceLabel: s.priceLabel,
          shortDescription: s.shortDescription,
          categoryName: g.name,
          categorySlug: g.slug,
        })),
      }))
      .filter((g) => g.services.length > 0);
  } catch (e) {
    console.error("[shop-data] getFeaturedServices failed:", e);
    return [];
  }
});

export interface TestimonialData {
  id: string;
  customerName: string;
  rating: number;
  text: string;
  serviceRef: string | null;
  location: string | null;
  photoUrl: string | null;
}

export const getTestimonials = cache(
  async (limit = 6): Promise<TestimonialData[]> => {
    try {
      const rows = await prisma.testimonial.findMany({
        where: { isApproved: true, isFeatured: true },
        orderBy: { sortOrder: "asc" },
        take: limit,
      });
      return rows.map((t) => ({
        id: t.id,
        customerName: t.customerName,
        rating: t.rating,
        text: t.text,
        serviceRef: t.serviceRef,
        location: t.location,
        photoUrl: t.photoUrl,
      }));
    } catch (e) {
      console.error("[shop-data] getTestimonials failed:", e);
      return [];
    }
  }
);

/** Counts for the gallery placeholder sections (YouTube / Photo / Video). */
export const getGalleryCounts = cache(async () => {
  const empty = { youtube: 0, photo: 0, video: 0 };
  try {
    const [youtube, photo, video] = await Promise.all([
      prisma.youtubeVideo.count(),
      prisma.galleryImage.count(),
      prisma.video.count(),
    ]);
    return { youtube, photo, video };
  } catch (e) {
    console.error("[shop-data] getGalleryCounts failed:", e);
    return empty;
  }
});
