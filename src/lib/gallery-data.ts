import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * Public gallery data layer (Phase 6).
 * Reads active items for the photo / video / youtube galleries and the
 * homepage media band. Fails soft so pages always render.
 */

export interface PhotoData {
  id: string;
  title: string | null;
  description: string | null;
  imageUrl: string;
  altText: string | null;
  category: string | null;
}

export interface VideoData {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  category: string | null;
}

export interface YoutubeData {
  id: string;
  title: string;
  description: string | null;
  youtubeId: string;
  youtubeUrl: string;
  thumbnailUrl: string | null;
  category: string | null;
}

export const getGalleryPhotos = cache(async (): Promise<PhotoData[]> => {
  try {
    const rows = await prisma.galleryImage.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      imageUrl: r.imageUrl,
      altText: r.altText,
      category: r.category,
    }));
  } catch (e) {
    console.error("[gallery-data] getGalleryPhotos failed:", e);
    return [];
  }
});

export const getGalleryVideos = cache(async (): Promise<VideoData[]> => {
  try {
    const rows = await prisma.video.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      videoUrl: r.videoUrl,
      thumbnailUrl: r.thumbnailUrl,
      category: r.category,
    }));
  } catch (e) {
    console.error("[gallery-data] getGalleryVideos failed:", e);
    return [];
  }
});

export const getYoutubeVideos = cache(async (): Promise<YoutubeData[]> => {
  try {
    const rows = await prisma.youtubeVideo.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      youtubeId: r.youtubeId,
      youtubeUrl: r.youtubeUrl,
      thumbnailUrl: r.thumbnailUrl,
      category: r.category,
    }));
  } catch (e) {
    console.error("[gallery-data] getYoutubeVideos failed:", e);
    return [];
  }
});

/** Small preview items for the homepage gallery band. */
export const getHomeGalleryPreviews = cache(async () => {
  const empty = { photos: [] as PhotoData[], youtube: [] as YoutubeData[] };
  try {
    const [photos, youtube] = await Promise.all([
      prisma.galleryImage.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        take: 4,
      }),
      prisma.youtubeVideo.findMany({
        where: { isActive: true, isFeatured: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        take: 4,
      }),
    ]);
    return {
      photos: photos.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        imageUrl: r.imageUrl,
        altText: r.altText,
        category: r.category,
      })),
      youtube: youtube.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        youtubeId: r.youtubeId,
        youtubeUrl: r.youtubeUrl,
        thumbnailUrl: r.thumbnailUrl,
        category: r.category,
      })),
    };
  } catch (e) {
    console.error("[gallery-data] getHomeGalleryPreviews failed:", e);
    return empty;
  }
});

/** Standard placeholder image generator reused across galleries. */
export function placeholderImage(
  label: string,
  bg = "312E81",
  fg = "E0C3FC"
): string {
  return `https://placehold.co/600x400/${bg}/${fg}/png?text=${encodeURIComponent(
    label
  )}`;
}

// -------------------------------------------------------------------------
// Homepage gallery section visibility (admin-controlled toggles)
// -------------------------------------------------------------------------

export interface GallerySectionsSettings {
  youtube: boolean;
  photo: boolean;
  video: boolean;
}

export const DEFAULT_GALLERY_SECTIONS: GallerySectionsSettings = {
  youtube: true,
  photo: true,
  video: true,
};

export const GALLERY_SECTIONS_STORAGE_KEY = "gallerySections";

/**
 * Reads the admin-controlled visibility toggles for the three homepage
 * gallery sections (YouTube / Photo / Video). Stored as a JSON SiteSetting
 * row; defaults to all visible.
 */
export const getGallerySections =
  cache(async (): Promise<GallerySectionsSettings> => {
    try {
      const row = await prisma.siteSetting.findUnique({
        where: { key: GALLERY_SECTIONS_STORAGE_KEY },
      });
      const v =
        row?.value && typeof row.value === "object"
          ? (row.value as Record<string, unknown>)
          : {};
      return {
        youtube:
          typeof v.youtube === "boolean" ? v.youtube : DEFAULT_GALLERY_SECTIONS.youtube,
        photo:
          typeof v.photo === "boolean" ? v.photo : DEFAULT_GALLERY_SECTIONS.photo,
        video:
          typeof v.video === "boolean" ? v.video : DEFAULT_GALLERY_SECTIONS.video,
      };
    } catch (e) {
      console.error("[gallery-data] getGallerySections failed:", e);
      return { ...DEFAULT_GALLERY_SECTIONS };
    }
  });