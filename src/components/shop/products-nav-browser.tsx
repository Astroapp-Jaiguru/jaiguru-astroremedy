"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronRight, LayoutGrid } from "lucide-react";
import type { NavMenuItem } from "@/lib/product-navigation";
import { cn } from "@/lib/utils";

/**
 * In-page multi-level product navigation browser for the /products catalogue.
 * Desktop: each top-level category is a trigger that opens a hover flyout
 * with unlimited nested levels (Groups → Types → Origins → Sizes).
 * Mobile: a collapsible accordion tree. Every node links to /products?nav=…
 * so clicking any level filters the grid.
 */

function NestedPanel({ items }: { items: NavMenuItem[] }) {
  return (
    <div className="absolute left-full top-0 z-50 hidden pl-1.5 group-hover/item:block">
      <div className="max-h-[70vh] w-64 overflow-y-auto rounded-2xl border border-golden/25 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.2)]">
        {items.map((child) => (
          <div key={child.slug} className="group/item relative">
            <Link
              href={child.href}
              className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-golden/10 hover:text-slate-900"
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

function AccordionTree({
  items,
  depth,
  onNavigate,
}: {
  items: NavMenuItem[];
  depth: number;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className={cn("flex flex-col", depth > 0 && "ml-3 border-l-2 border-golden/30 pl-2")}>
      {items.map((item) => {
        const hasKids = item.children.length > 0;
        const isOpen = open === item.slug;
        return (
          <div key={item.slug}>
            {hasKids ? (
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : item.slug)}
                className="flex min-h-[40px] w-full items-center justify-between rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-golden/10 hover:text-foreground"
              >
                {item.name}
                <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
              </button>
            ) : (
              <Link
                href={item.href}
                onClick={onNavigate}
                className="flex min-h-[40px] items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-golden/10 hover:text-foreground"
              >
                {item.name}
              </Link>
            )}
            {hasKids && isOpen ? (
              <AccordionTree items={item.children} depth={depth + 1} onNavigate={onNavigate} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function ProductsNavBrowser({ items }: { items: NavMenuItem[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      {/* Desktop: category strip with hover flyouts */}
      <div className="hidden items-center gap-2 md:flex md:flex-wrap">
        <span className="mr-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#FACC15]/70">
          <LayoutGrid className="h-3.5 w-3.5" />
          Browse
        </span>
        {items.map((item) => (
          <div key={item.slug} className="group/cat relative">
            <Link
              href={item.href}
              className="flex items-center gap-1.5 rounded-full border border-[#D4AF37]/40 bg-[#0B1120]/60 px-4 py-2 text-sm font-semibold text-[#FACC15] shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition hover:border-[#FACC15]/70 hover:bg-[#FACC15]/10"
            >
              {item.name}
              {item.children.length > 0 ? (
                <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover/cat:rotate-180" />
              ) : null}
            </Link>
            {item.children.length > 0 ? (
              <div className="invisible absolute left-0 top-full z-40 pt-2 opacity-0 transition-all duration-200 group-hover/cat:visible group-hover/cat:opacity-100">
                <div className="max-h-[70vh] w-64 overflow-y-auto rounded-2xl border border-golden/25 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.2)]">
                  {item.children.map((child) => (
                    <div key={child.slug} className="group/item relative">
                      <Link
                        href={child.href}
                        className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-golden/10 hover:text-slate-900"
                      >
                        {child.name}
                        {child.children.length > 0 ? (
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#B8860B]" />
                        ) : null}
                      </Link>
                      {child.children.length > 0 ? <NestedPanel items={child.children} /> : null}
                    </div>
                  ))}
                  <div className="mt-1 border-t border-golden/25 pt-1">
                    <Link
                      href={item.href}
                      className="block rounded-xl px-3 py-2 text-sm font-bold text-[#B8860B] transition-colors hover:bg-golden/10 hover:text-[#9A6B00]"
                    >
                      All {item.name} →
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* Mobile: collapsible accordion */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-[#D4AF37]/40 bg-[#0B1120]/60 px-4 py-3 text-sm font-semibold text-[#FACC15] transition hover:bg-[#FACC15]/10"
        >
          <span className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            Browse by Category
          </span>
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", mobileOpen && "rotate-180")} />
        </button>
        {mobileOpen ? (
          <div className="mt-2 rounded-2xl border border-white/15 bg-white/[0.06] p-3 backdrop-blur-xl">
            <Link
              href="/products"
              onClick={() => setMobileOpen(false)}
              className="flex min-h-[40px] items-center rounded-lg px-3 text-sm font-bold text-[#B8860B] transition-colors hover:bg-golden/10 hover:text-[#9A6B00]"
            >
              Browse All Products →
            </Link>
            <AccordionTree items={items} depth={0} onNavigate={() => setMobileOpen(false)} />
          </div>
        ) : null}
      </div>
    </div>
  );
}