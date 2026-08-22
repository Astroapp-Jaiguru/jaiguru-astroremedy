import { Gem, Home, Sparkles, Activity, Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Maps a product category slug to a Lucide icon used in image placeholders.
 * Rendered directly (no component created during render).
 */
export function CategoryGlyph({
  categorySlug,
  className,
}: {
  categorySlug?: string | null;
  className?: string;
}) {
  switch (categorySlug) {
    case "gemstones":
      return <Gem className={className} />;
    case "vastu-items":
      return <Home className={className} />;
    case "yoga-equipment":
      return <Activity className={className} />;
    case "spiritual-items":
      return <Sparkles className={className} />;
    default:
      return <Star className={className} />;
  }
}

/** Rating stars rendered as filled gold stars (scope §7.6). */
export function RatingStars({ rating }: { rating: string | number }) {
  const value = typeof rating === "number" ? rating : Number.parseFloat(rating);
  const stars = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <div className="flex items-center gap-1" aria-label={`Rated ${value} out of 5`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              i < stars
                ? "fill-golden text-golden"
                : "fill-slate-700 text-slate-700"
            )}
          />
        ))}
      </div>
      <span className="ml-1 text-xs font-medium text-slate-300">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

/** Gradient used behind product image placeholders. */
export const IMAGE_FALLBACK_STYLES =
  "bg-gradient-to-br from-[var(--jaiguru-dark-2)] via-indigo-deep to-royal-purple";
