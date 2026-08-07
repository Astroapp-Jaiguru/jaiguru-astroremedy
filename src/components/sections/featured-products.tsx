import Link from "next/link";
import { SectionHeading } from "@/components/sections/section-heading";
import { ProductCard, type ProductCardData } from "@/components/shop/product-card";
import { getFeaturedProducts } from "@/lib/shop-data";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import type { ReactElement } from "react";

/**
 * Featured products (scope §7.6). Exactly 12 featured products in a 4-column
 * grid on desktop. "View All Products" CTA at the bottom.
 */
export async function FeaturedProducts(): Promise<ReactElement> {
  const products = await getFeaturedProducts(12);
  if (products.length === 0) return <></>;

  return (
    <section
      id="featured-products"
      aria-label="Featured products"
      className="scroll-mt-24 py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Divine Shop"
            title="Featured"
            highlight="Products"
            subtitle="Energised spiritual items, gemstones, vastu remedies and yoga essentials — handpicked and recommended by Jai Guru."
          />
        </Reveal>
        <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <RevealItem key={product.id}>
              <ProductCard
                product={product as ProductCardData}
              />
            </RevealItem>
          ))}
        </RevealGroup>
        <Reveal className="mt-12 flex justify-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#4C1D95] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(76,29,149,0.45)] transition hover:bg-[#3B0F82]"
          >
            View All Products
          </Link>
        </Reveal>
      </div>
    </section>
  );
}