"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight, Boxes } from "lucide-react";
import type { NavMenuItem } from "@/lib/product-navigation";

/** Recursive flyout panel shown to the right of a hovered item. */
function NestedPanel({ items }: { items: NavMenuItem[] }) {
  return (
    <div className="absolute left-full top-0 z-50 hidden pl-1.5 group-hover/item:block">
      <div className="max-h-[70vh] w-64 overflow-y-auto rounded-2xl border border-golden/25 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.2)]">
        {items.map((child) => (
          <div key={child.slug} className="group/item relative">
            <Link
              href={child.href}
              className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-golden/10 hover:text-foreground"
            >
              {child.name}
              {child.children.length > 0 ? (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#B8860B]" />
              ) : null}
            </Link>
            {child.children.length > 0 ? <NestedPanel items={child.children} /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Desktop "Product List" trigger: a hover flyout that supports unlimited
 * nesting levels (Categories → Groups → Types → Origins → Sizes). Clicking
 * any level jumps to /products filtered by that level's subtree.
 */
export function ProductListMenu({ items }: { items: NavMenuItem[] }) {
  if (items.length === 0) {
    return (
      <Link
        href="/products"
        className="relative pb-2 text-[15px] font-semibold text-foreground transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-golden after:transition-all after:duration-300 hover:text-royal-purple hover:after:w-full"
      >
        Products
      </Link>
    );
  }

  return (
    <div className="group relative">
      <button
        type="button"
        className="relative flex cursor-pointer items-center gap-1 pb-2 text-[15px] font-semibold text-foreground transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-golden after:transition-all after:duration-300 hover:text-royal-purple group-hover:after:w-full"
      >
        <Boxes className="h-4 w-4 text-[#B8860B]" />
        Product List
        <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
      </button>
      <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
        <div className="max-h-[70vh] w-72 overflow-y-auto rounded-2xl border border-golden/25 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.15)]">
          {items.map((item) => (
            <div key={item.slug} className="group/item relative">
              <Link
                href={item.href}
                className="flex items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-golden/10 hover:text-foreground"
              >
                {item.name}
                {item.children.length > 0 ? (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#B8860B]" />
                ) : null}
              </Link>
              {item.children.length > 0 ? <NestedPanel items={item.children} /> : null}
            </div>
          ))}
          <div className="mt-1 border-t border-golden/25 pt-1">
            <Link
              href="/products"
              className="block rounded-xl px-4 py-2.5 text-sm font-bold text-[#B8860B] transition-colors hover:bg-golden/10 hover:text-[#9A6B00]"
            >
              Browse All Products →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}