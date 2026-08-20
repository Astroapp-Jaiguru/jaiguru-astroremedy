"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Client-side pagination for the /products catalogue. Uses router.push
 * (instead of Link's default navigation) because query-string Link
 * navigation is unreliable on Turbopack builds; keeps the <a> semantics
 * for crawlers.
 */
export function Pagination({ base, current, pages }: { base: string; current: number; pages: number }) {
  const router = useRouter();

  const go = (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push(href, { scroll: false });
  };

  if (pages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {current > 1 ? (
        <Link
          href={`${base}${base.includes("?") ? "&" : "?"}page=${current - 1}`}
          onClick={go(`${base}${base.includes("?") ? "&" : "?"}page=${current - 1}`)}
          className="rounded-full border border-[#D4AF37]/40 px-4 py-2 text-sm text-[#FACC15] transition hover:bg-[#FACC15]/10"
        >
          Previous
        </Link>
      ) : null}
      {Array.from({ length: pages }).map((_, i) => {
        const n = i + 1;
        const isCurrent = n === current;
        return (
          <Link
            key={n}
            href={`${base}${base.includes("?") ? "&" : "?"}page=${n}`}
            onClick={go(`${base}${base.includes("?") ? "&" : "?"}page=${n}`)}
            className={`rounded-full px-4 py-2 text-sm transition ${
              isCurrent
                ? "bg-[#4C1D95] font-semibold text-white"
                : "border border-[#D4AF37]/40 text-[#FACC15] hover:bg-[#FACC15]/10"
            }`}
          >
            {n}
          </Link>
        );
      })}
      {current < pages ? (
        <Link
          href={`${base}${base.includes("?") ? "&" : "?"}page=${current + 1}`}
          onClick={go(`${base}${base.includes("?") ? "&" : "?"}page=${current + 1}`)}
          className="rounded-full border border-[#D4AF37]/40 px-4 py-2 text-sm text-[#FACC15] transition hover:bg-[#FACC15]/10"
        >
          Next
        </Link>
      ) : null}
    </nav>
  );
}