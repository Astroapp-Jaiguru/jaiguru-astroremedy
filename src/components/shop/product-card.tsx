import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, Flame, TrendingUp } from "lucide-react";
import { WhatsappIcon } from "@/components/layout/social-icons";
import { CategoryGlyph, RatingStars, IMAGE_FALLBACK_STYLES } from "@/components/sections/shop-helpers";
import { formatPrice } from "@/lib/shop-data";
import { whatsappLink, productOrderMessage } from "@/config/site";
import { siteConfig } from "@/config/site";

/**
 * Shared premium product card used on the homepage (featured) and the
 * /products listing. Image, name, category, price, discount, rating stars,
 * feature badge, WhatsApp "Order" button and "View Details" link.
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
}

const BADGE_PREMIUM =
  "inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FACC15] to-[#F97316] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-900";

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
        className="h-14 w-14 text-[#FACC15]/60 drop-shadow-[0_0_18px_rgba(250,204,21,0.35)]"
      />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.25em] text-[#FACC15]/70">
        {product.category?.name ?? "Product"}
      </div>
    </div>
  );
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const hasDiscount =
    product.discountPrice &&
    Number.parseFloat(product.discountPrice) < Number.parseFloat(product.price);
  const waMessage = whatsappLink(
    productOrderMessage({
      name: product.name,
      category: product.category?.name ?? null,
      price: product.discountPrice ?? product.price,
      url: `/products/${product.slug}`,
    }),
    siteConfig.contact.whatsappNumber
  );

  return (
    <article className="group flex flex-col overflow-hidden rounded-[var(--jaiguru-product-card-radius)] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(76,29,149,0.45)]">
      <div className="relative">
        {product.mainImage ? (
          <Image
            src={product.mainImage}
            alt={product.name}
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
        {hasDiscount && product.discountPrice ? (
          <span className="absolute right-3 top-3 rounded-full bg-[#F97316] px-2 py-1 text-[10px] font-bold text-white">
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
          <span className="rounded-full bg-[#4C1D95]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#4C1D95]">
            {product.category?.name ?? "Product"}
          </span>
          <RatingStars rating={product.rating} />
        </div>
        <h3 className="font-display text-base font-bold leading-snug text-slate-900">
          {product.name}
        </h3>
        {product.shortDescription ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
            {product.shortDescription}
          </p>
        ) : null}
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-lg font-bold text-[#4C1D95]">
            {formatPrice(product.discountPrice ?? product.price)}
          </span>
          {hasDiscount ? (
            <span className="text-sm text-slate-400 line-through">
              {formatPrice(product.price)}
            </span>
          ) : null}
        </div>
        <div className="mt-auto flex gap-2 pt-2">
          <a
            href={waMessage}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[var(--jaiguru-btn-radius)] bg-[#25D366] px-3 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#1EBE5B]"
          >
            <WhatsappIcon className="h-3.5 w-3.5" />
            Order
          </a>
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-[var(--jaiguru-btn-radius)] border-2 border-[#4C1D95] px-3 py-2.5 text-xs font-semibold text-[#4C1D95] transition hover:bg-[#4C1D95] hover:text-white"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}