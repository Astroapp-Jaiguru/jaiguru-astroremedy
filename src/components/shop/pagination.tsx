"use client";

/**
 * Client-side pagination for the /products grid. Calls onPage(n) so the
 * parent can refetch instantly; renders as a button group (the full query
 * string lives in the parent, so anchors would be misleading).
 */
export function Pagination({
  current,
  pages,
  onPage,
}: {
  current: number;
  pages: number;
  onPage: (n: number) => void;
}) {
  if (pages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {current > 1 ? (
        <button
          type="button"
          onClick={() => onPage(current - 1)}
          className="rounded-full border border-[#D4AF37]/40 px-4 py-2 text-sm text-[#FACC15] transition hover:bg-[#FACC15]/10"
        >
          Previous
        </button>
      ) : null}
      {Array.from({ length: pages }).map((_, i) => {
        const n = i + 1;
        const isCurrent = n === current;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onPage(n)}
            className={`rounded-full px-4 py-2 text-sm transition ${
              isCurrent
                ? "bg-[#4C1D95] font-semibold text-white"
                : "border border-[#D4AF37]/40 text-[#FACC15] hover:bg-[#FACC15]/10"
            }`}
          >
            {n}
          </button>
        );
      })}
      {current < pages ? (
        <button
          type="button"
          onClick={() => onPage(current + 1)}
          className="rounded-full border border-[#D4AF37]/40 px-4 py-2 text-sm text-[#FACC15] transition hover:bg-[#FACC15]/10"
        >
          Next
        </button>
      ) : null}
    </nav>
  );
}