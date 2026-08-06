import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CategoryGlyph, RatingStars, IMAGE_FALLBACK_STYLES } from "@/components/sections/shop-helpers";
import { ProductCard, type ProductCardData } from "@/components/shop/product-card";
import { formatPrice } from "@/lib/shop-data";
import { whatsappLink, productOrderMessage } from "@/config/site";
import { WhatsappIcon } from "@/components/layout/social-icons";

/**
 * Product detail page (scope §15.3). Image, title, category, price +
 * discount, description, benefits, meta and a WhatsApp "Order" button with
 * the auto-filled order message template.
 */

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} | JAIGURU ASTROREMEDY`,
    description: product.shortDescription ?? product.longDescription ?? undefined,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: { select: { name: true, slug: true } } },
  });
  if (!product || !product.isActive) notFound();

  const hasDiscount =
    product.discountPrice &&
    Number.parseFloat(product.discountPrice.toString()) <
      Number.parseFloat(product.price.toString());
  const price = product.discountPrice ?? product.price;
  const waMessage = whatsappLink(
    productOrderMessage({
      name: product.name,
      category: product.category?.name ?? null,
      price: price.toString(),
      url: `/products/${product.slug}`,
    })
  );

  const related = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: { category: { select: { name: true, slug: true } } },
    take: 4,
  });
  const relatedData: ProductCardData[] = related.map((p) => ({
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

  const meta: { label: string; value: string }[] = [
    ...(product.subcategory ? [{ label: "Type", value: product.subcategory }] : []),
    ...(product.material ? [{ label: "Material", value: product.material }] : []),
    ...(product.size ? [{ label: "Size", value: product.size }] : []),
    ...(product.weight ? [{ label: "Weight", value: product.weight }] : []),
    ...(product.color ? [{ label: "Color", value: product.color }] : []),
    ...(product.sku ? [{ label: "SKU", value: product.sku }] : []),
  ];

  return (
    <section className="scroll-mt-24 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-1.5 text-sm text-slate-400">
          <Link href="/" className="transition hover:text-[#FACC15]">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/products" className="transition hover:text-[#FACC15]">Products</Link>
          {product.category ? (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link
                href={`/products?category=${product.category.slug}`}
                className="transition hover:text-[#FACC15]"
              >
                {product.category.name}
              </Link>
            </>
          ) : null}
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate text-[#FACC15]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Image */}
          <div className="relative">
            <div
              className={`relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-3xl border-2 border-[#D4AF37]/30 shadow-[0_18px_60px_rgba(0,0,0,0.5)] ${
                product.mainImage ? "" : IMAGE_FALLBACK_STYLES
              }`}
            >
              {product.mainImage ? (
                <Image
                  src={product.mainImage}
                  alt={product.name}
                  width={800}
                  height={600}
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(250,204,21,0.18),transparent_55%)]" />
                  <CategoryGlyph
                    categorySlug={product.category?.slug}
                    className="h-24 w-24 text-[#FACC15]/60 drop-shadow-[0_0_25px_rgba(250,204,21,0.4)]"
                  />
                </>
              )}
            </div>
            {hasDiscount && product.discountPrice ? (
              <span className="absolute left-4 top-4 rounded-full bg-[#F97316] px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                SAVE{" "}
                {Math.round(
                  ((Number.parseFloat(product.price.toString()) -
                    Number.parseFloat(product.discountPrice.toString())) /
                    Number.parseFloat(product.price.toString())) *
                    100
                )}
                %
              </span>
            ) : null}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              {product.category ? (
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="rounded-full bg-[#4C1D95]/20 px-3 py-1 text-xs font-semibold text-[#FACC15] transition hover:bg-[#4C1D95]/40"
                >
                  {product.category.name}
                </Link>
              ) : null}
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  product.stockStatus === "IN_STOCK"
                    ? "bg-[#25D366]/15 text-[#25D366]"
                    : product.stockStatus === "PRE_ORDER"
                      ? "bg-[#FACC15]/15 text-[#FACC15]"
                      : "bg-red-500/15 text-red-400"
                }`}
              >
                {product.stockStatus === "IN_STOCK"
                  ? "In Stock"
                  : product.stockStatus === "PRE_ORDER"
                    ? "Pre Order"
                    : "Out of Stock"}
              </span>
            </div>

            <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
              {product.name}
            </h1>

            <div className="flex items-center gap-3">
              <RatingStars rating={product.rating.toString()} />
              <span className="text-xs text-slate-500">
                ({product.ratingCount} reviews)
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-display text-3xl font-bold text-[#FACC15]">
                {formatPrice(price)}
              </span>
              {hasDiscount ? (
                <span className="text-xl text-slate-500 line-through">
                  {formatPrice(product.price)}
                </span>
              ) : null}
            </div>

            {product.shortDescription ? (
              <p className="leading-relaxed text-slate-300">
                {product.shortDescription}
              </p>
            ) : null}
            {product.longDescription ? (
              <p className="text-sm leading-relaxed text-slate-400">
                {product.longDescription}
              </p>
            ) : null}

            {product.benefits.length > 0 ? (
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {product.benefits.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#25D366]/15">
                      <Check className="h-3 w-3 text-[#25D366]" />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            ) : null}

            {meta.length > 0 ? (
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-2xl border border-white/10 bg-[#0F172A]/60 p-5 sm:grid-cols-3">
                {meta.map((m) => (
                  <div key={m.label}>
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      {m.label}
                    </dt>
                    <dd className="truncate text-sm text-slate-200">{m.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <a
              href={waMessage}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-8 py-4 text-base font-bold text-white shadow-[0_10px_30px_rgba(37,211,102,0.35)] transition hover:bg-[#1EBE5B]"
            >
              <WhatsappIcon className="h-5 w-5" />
              Order on WhatsApp
            </a>
            <p className="text-xs text-slate-500">
              Questions about this item? Chat with us - we reply quickly with
              availability, shipping and payment via UPI.
            </p>
          </div>
        </div>

        {relatedData.length > 0 ? (
          <div className="mt-20">
            <h2 className="mb-8 font-display text-2xl font-bold text-white">
              You May Also{" "}
              <span className="bg-gradient-to-r from-[#FACC15] via-[#D4AF37] to-[#F97316] bg-clip-text text-transparent">
                Like
              </span>
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedData.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}