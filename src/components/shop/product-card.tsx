import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, Flame, TrendingUp } from "lucide-react";
import { CategoryGlyph, RatingStars, IMAGE_FALLBACK_STYLES } from "@/components/sections/shop-helpers";
import { formatPrice } from "@/lib/shop-data";
import { productPriceDisplay } from "@/lib/pricing/geo";
import {
  certificateTierForPrice,
  withCertificateSuffix,
  CERTIFICATE_TIER_LABEL,
  CERTIFICATE_TIER_BADGE_CLASS,
} from "@/lib/products/certificate";

/**
 * Shared premium product card used on the homepage (featured) and the
 * /products listing. Image, name, category, price, discount, rating stars,
 * feature badge and "View Details" link. Orders start on the detail page.
 */
export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  mainImage: string | null;
  price: string;
  discountPrice: string | null;
  shortDescription: string | null;
  category: { name: string; slug: string } | null;
  isPopular: boolean;
  isNewArrival: boolean;
  rating: string;
  ratingCount: number;
  hasVariants?: boolean;
}

const BADGE_PREMIUM =
  "inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-golden to-saffron px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-900";

function FeatureBadge({ product }: { product: ProductCardData }) {
  if (product.isPopular)
    return (
      <span className={BADGE_PREMIUM}>
        <Flame className="h-3 w-3" /> Bestseller
      </span>
    );
  if (product.isNewArrival)
    return (
      <span className={BADGE_PREMIUM}>
        <TrendingUp className="h-3 w-3" /> New
      </span>
    );
  return (
    <span className={BADGE_PREMIUM}>
      <BadgeCheck className="h-3 w-3" /> Featured
    </span>
  );
}

function ProductImagePlaceholder({ product }: { product: ProductCardData }) {
  return (
    <div
      className={`relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden ${IMAGE_FALLBACK_STYLES}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(250,204,21,0.18),transparent_55%)]" />
      <CategoryGlyph
        categorySlug={product.category?.slug}
        className="h-14 w-14 text-golden/60 drop-shadow-[0_0_18px_rgba(250,204,21,0.35)]"
      />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.25em] text-golden/70">
        {product.category?.name ?? "Product"}
      </div>
    </div>
  );
}

export async function ProductCard({ product }: { product: ProductCardData }) {
  const hasDiscount =
    product.discountPrice &&
    Number.parseFloat(product.discountPrice) < Number.parseFloat(product.price);
  const tier = certificateTierForPrice(product.price);
  const displayName = withCertificateSuffix(product.name, tier);
  const orderPrice = product.discountPrice ?? product.price;
  const display = await productPriceDisplay(
    orderPrice,
    hasDiscount ? product.price : null
  );

  return (
    <article className="glass-card-light group flex flex-col overflow-hidden rounded-[var(--jaiguru-product-card-radius)] transition-all duration-300 hover:-translate-y-1.5 hover:border-golden/70 hover:shadow-[0_18px_50px_rgba(250,204,21,0.28)]">
      <div className="relative">
        {product.mainImage ? (
          <Image
            src={product.mainImage}
            alt={displayName}
            width={400}
            height={300}
            className="aspect-[4/3] w-full object-cover"
          />
        ) : (
          <ProductImagePlaceholder product={product} />
        )}
        <div className="absolute left-3 top-3">
          <FeatureBadge product={product} />
        </div>
        {tier ? (
          <span
            className={`${CERTIFICATE_TIER_BADGE_CLASS[tier]} absolute bottom-3 right-3 px-2.5 py-1 text-[10px]`}
          >
            <BadgeCheck className="h-3 w-3" />
            {CERTIFICATE_TIER_LABEL[tier]}
          </span>
        ) : null}
        {hasDiscount && product.discountPrice ? (
          <span className="absolute right-3 top-3 rounded-full bg-saffron px-2 py-1 text-[10px] font-bold text-white">
            -
            {Math.round(
              ((Number.parseFloat(product.price) -
                Number.parseFloat(product.discountPrice)) /
                Number.parseFloat(product.price)) *
                100
            )}
            %
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-royal-purple/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-royal-purple">
            {product.category?.name ?? "Product"}
          </span>
          <RatingStars rating={product.rating} />
        </div>
        <h3 className="font-display text-base font-bold leading-snug text-[var(--jaiguru-card-text)]">
          {displayName}
        </h3>
        {product.shortDescription ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-[var(--jaiguru-card-text-muted)]">
            {product.shortDescription}
          </p>
        ) : null}
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-lg font-bold text-royal-purple">
            {product.hasVariants ? "From " : ""}
            {display.effective?.label ?? formatPrice(product.discountPrice ?? product.price)}
          </span>
          {hasDiscount ? (
            <span className="text-sm text-slate-400 line-through">
              {display.original?.label ?? formatPrice(product.price)}
            </span>
          ) : null}
        </div>
        {display.effective ? (
          <p className="text-[10px] leading-snug text-slate-500">{display.effective.note}</p>
        ) : null}
        <div className="mt-auto flex gap-2 pt-2">
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-[var(--jaiguru-btn-radius)] border-2 border-[var(--jaiguru-cta-primary)] px-3 py-2.5 text-xs font-semibold text-[var(--jaiguru-cta-primary)] transition hover:bg-[var(--jaiguru-cta-primary)] hover:text-white"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}