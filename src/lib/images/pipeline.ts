import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { fetchUnsplash, searchKeyword } from "./unsplash";
import { buildPrompt, generateImage } from "./ai";
import {
  getPricingRunMeta,
  savePricingRunMeta,
} from "@/lib/pricing/settings";

/**
 * Automated image pipeline: finds products without a main image and fills
 * them in with (1) an Unsplash fallback or (2) AI-generated imagery for
 * niche items Unsplash cannot match. Manual uploads are never overwritten â€”
 * the pipeline only touches products with no main image at all.
 */

export interface ImageRunSummary {
  fetched: number; // products scanned
  assigned: number; // got an image (unsplash | ai)
  failed: number; // no image could be produced
  dormant: boolean; // true when no provider keys are configured
  detail: string[]; // per-item notes (capped)
}

export async function assignImagesForMissing(options: {
  timeBudgetMs?: number;
  limit?: number;
  categoryMap?: boolean;
}): Promise<ImageRunSummary> {
  const { timeBudgetMs = 8000, limit = 30 } = options;
  const started = Date.now();

  const hasUnsplash = Boolean(process.env.UNSPLASH_ACCESS_KEY);
  const hasAi = Boolean(process.env.OPENAI_API_KEY || process.env.REPLICATE_API_TOKEN);
  if (!hasUnsplash && !hasAi) {
    return { fetched: 0, assigned: 0, failed: 0, dormant: true, detail: [] };
  }

  const products = await prisma.product.findMany({
    where: { mainImage: null, isActive: true },
    take: limit,
    orderBy: { updatedAt: "asc" },
    include: { category: { select: { name: true } } },
  });

  const summary: ImageRunSummary = {
    fetched: products.length,
    assigned: 0,
    failed: 0,
    dormant: false,
    detail: [],
  };

  for (const product of products) {
    if (Date.now() - started > timeBudgetMs) {
      summary.detail.push("time budget reached â€” stopped early");
      break;
    }

    try {
      let assigned = false;

      if (hasUnsplash) {
        const keyword = searchKeyword(product.name, product.category.name);
        const hit = await fetchUnsplash(keyword);
        if (hit) {
          await prisma.product.update({
            where: { id: product.id },
            data: {
              mainImage: hit.url,
              imageSource: "unsplash",
              imageCredit: hit.credit,
            },
          });
          summary.assigned++;
          summary.detail.push(`${product.name} â†’ unsplash (${hit.photoId})`);
          assigned = true;
        }
      }

      if (!assigned && hasAi) {
        const prompt = buildPrompt(product.name);
        const img = await generateImage(prompt);
        if (img) {
          const saved = await prisma.siteImage.create({
            data: {
              filename: `${product.slug}-ai.png`,
              mimeType: img.mimeType,
              size: img.bytes.length,
              data: new Uint8Array(img.bytes),
            },
          });
          await prisma.product.update({
            where: { id: product.id },
            data: {
              mainImage: `/api/site-images/${saved.id}`,
              imageSource: "ai",
              imageCredit: "AI-generated",
            },
          });
          summary.assigned++;
          summary.detail.push(`${product.name} â†’ ai`);
          assigned = true;
        }
      }

      if (!assigned) summary.failed++;
    } catch (e) {
      console.error(`[images] pipeline failed for ${product.name}:`, e);
      summary.failed++;
    }
  }

  try {
    const meta = await getPricingRunMeta();
    meta.lastImageRunAt = new Date().toISOString();
    meta.lastImageRunSummary = summary as unknown as Record<string, unknown>;
    await savePricingRunMeta(meta);
  } catch (e) {
    console.error("[images] failed to persist run meta:", e);
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/pricing");
  return summary;
}