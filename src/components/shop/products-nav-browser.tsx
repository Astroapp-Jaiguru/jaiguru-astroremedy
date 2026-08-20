"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, LayoutGrid, X } from "lucide-react";
import type { NavMenuItem } from "@/lib/product-navigation";
import { cn } from "@/lib/utils";

/**
 * In-page multi-level product navigation browser for the /products catalogue.
 * Desktop: hovering a category pill opens a cascading menu — every submenu
 * appears instantly to the right of the hovered row (or below / to the left
 * near the viewport edge) with a subtle fade+slide animation. Panels are
 * fixed-positioned so submenus are never clipped; rows are compact enough
 * that every level fits without any scrollbar. Mobile: a full-screen
 * slide-out drawer with large touch targets.
 */

const PANEL_WIDTH = 256;
const ROW_H = 32;
const GAP = 8;

interface Panel {
  items: NavMenuItem[];
  left: number;
  top: number;
  footer?: { href: string; label: string };
}

function estimateHeight(items: NavMenuItem[], withFooter: boolean): number {
  return items.length * ROW_H + 12 + (withFooter ? 36 : 0);
}

/** Place a panel to the right of (x,y), flipping below/left near the edges. */
function fitPanel(x: number, y: number, w: number, h: number): { left: number; top: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const left = x + w + GAP > vw ? Math.max(GAP, x - w - GAP) : x + GAP;
  const top = Math.min(Math.max(y, GAP), Math.max(GAP, vh - h - GAP));
  return { left, top };
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
    <div className={cn("flex flex-col", depth > 0 && "ml-3 border-l-2 border-golden/30 pl-3")}>
      {items.map((item) => {
        const hasKids = item.children.length > 0;
        const isOpen = open === item.slug;
        return (
          <div key={item.slug}>
            {hasKids ? (
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : item.slug)}
                className="flex min-h-12 w-full items-center justify-between rounded-xl px-3.5 text-[15px] font-medium text-slate-200 transition-colors hover:bg-golden/10 hover:text-[#FACC15]"
              >
                {item.name}
                <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
              </button>
            ) : (
              <Link
                href={item.href}
                onClick={onNavigate}
                className="flex min-h-12 items-center rounded-xl px-3.5 text-[15px] font-medium text-slate-200 transition-colors hover:bg-golden/10 hover:text-[#FACC15]"
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
  const [panels, setPanels] = useState<Panel[]>([]);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeAll = useCallback(() => setPanels([]), []);

  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(closeAll, 250);
  }, [closeAll]);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  // Close the menu on page scroll or viewport resize so positions stay correct.
  useEffect(() => {
    const close = () => closeAll();
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [closeAll]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  /** Open the first-level panel below the hovered category pill. */
  const openRoot = (item: NavMenuItem, pillEl: HTMLElement) => {
    if (item.children.length === 0) return;
    const rect = pillEl.getBoundingClientRect();
    const h = estimateHeight(item.children, true);
    const top = Math.min(Math.max(rect.bottom + GAP, GAP), Math.max(GAP, window.innerHeight - h - GAP));
    const left = Math.max(GAP, Math.min(rect.left, window.innerWidth - PANEL_WIDTH - GAP));
    setPanels([
      {
        items: item.children,
        left,
        top,
        footer: { href: item.href, label: `All ${item.name} →` },
      },
    ]);
  };

  /** Hovering a row opens its submenu to the right; leaves truncate deeper panels. */
  const openRow = (depth: number, child: NavMenuItem, rowEl: HTMLElement) => {
    if (child.children.length === 0) {
      setPanels((p) => p.slice(0, depth + 1));
      return;
    }
    const rect = rowEl.getBoundingClientRect();
    const h = estimateHeight(child.children, false);
    const pos = fitPanel(rect.right, rect.top, PANEL_WIDTH, h);
    setPanels((p) => {
      const next = p.slice(0, depth + 1);
      next.push({ items: child.children, left: pos.left, top: pos.top });
      return next;
    });
  };

  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      <style>{`
        .jf-nav-in { animation: jf-nav-in 0.16s ease-out both; transform-origin: top left; }
        @keyframes jf-nav-in { from { opacity: 0; transform: translateY(6px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .jf-drawer-in { animation: jf-drawer-in 0.28s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @keyframes jf-drawer-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>

      {/* Desktop: category pills + cascading fixed-position panels */}
      <div
        className="relative hidden md:block"
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
            <LayoutGrid className="h-3.5 w-3.5" />
            Browse
          </span>
          {items.map((item) => (
            <div
              key={item.slug}
              onMouseEnter={(e) => openRoot(item, e.currentTarget)}
            >
              <Link
                href={item.href}
                onClick={closeAll}
                className="flex items-center gap-1.5 rounded-full border border-[#D4AF37]/40 bg-[#0B1120]/60 px-4 py-2 text-sm font-semibold text-[#FACC15] shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition hover:border-[#FACC15]/70 hover:bg-[#FACC15]/10"
              >
                {item.name}
                {item.children.length > 0 ? <ChevronDown className="h-3.5 w-3.5" /> : null}
              </Link>
            </div>
          ))}
        </div>

        {panels.map((panel, depth) => (
          <div
            key={depth}
            className="fixed z-50"
            style={{ left: panel.left, top: panel.top }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <div className="jf-nav-in w-64 rounded-2xl border border-white/25 bg-white/95 p-1.5 shadow-[0_24px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl">
              {panel.items.map((child) => (
                <div
                  key={child.slug}
                  onMouseEnter={(e) => openRow(depth, child, e.currentTarget)}
                >
                  <Link
                    href={child.href}
                    onClick={closeAll}
                    className="flex h-8 items-center justify-between gap-2 rounded-xl px-2.5 text-[13px] font-medium text-slate-700 transition-colors hover:bg-golden/10 hover:text-slate-900"
                  >
                    {child.name}
                    {child.children.length > 0 ? (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#B8860B]" />
                    ) : null}
                  </Link>
                </div>
              ))}
              {panel.footer ? (
                <div className="mt-1 border-t border-golden/25 pt-1">
                  <Link
                    href={panel.footer.href}
                    onClick={closeAll}
                    className="block h-8 rounded-xl px-2.5 py-1.5 text-[13px] font-bold text-[#B8860B] transition-colors hover:bg-golden/10 hover:text-[#9A6B00]"
                  >
                    {panel.footer.label}
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: trigger + full-screen slide-out drawer */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex w-full items-center justify-between rounded-xl border border-[#D4AF37]/40 bg-[#0B1120]/60 px-4 py-3 text-sm font-semibold text-[#FACC15] transition hover:bg-[#FACC15]/10"
        >
          <span className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            Browse by Category
          </span>
          <ChevronDown className="h-4 w-4" />
        </button>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="jf-drawer-in absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col border-l border-golden/20 bg-[#0B1120]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <span className="flex items-center gap-2 text-sm font-semibold text-[#FACC15]">
                  <LayoutGrid className="h-4 w-4" />
                  Browse Categories
                </span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <Link
                  href="/products"
                  onClick={() => setMobileOpen(false)}
                  className="mb-2 flex min-h-12 items-center rounded-xl bg-gradient-to-r from-[#FACC15]/15 to-[#F97316]/15 px-3.5 text-[15px] font-bold text-[#FACC15] transition hover:brightness-110"
                >
                  Browse All Products →
                </Link>
                <AccordionTree items={items} depth={0} onNavigate={() => setMobileOpen(false)} />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}